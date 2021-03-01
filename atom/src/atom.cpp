#include <atom/atom.hpp>

namespace proton
{
  void atom::addplan (
    const uint64_t& oracle_index,
    const uint64_t& plan_days,
    const uint64_t& multiplier,
    const bool& is_stake_active,
    const bool& is_claim_active
  ) {
    require_auth(get_self());
    _plans.emplace(get_self(), [&](auto& p) {
      p.index = _plans.available_primary_key();
      p.oracle_index = oracle_index;
      p.plan_days = plan_days;
      p.multiplier = multiplier;
      p.is_stake_active = is_stake_active;
      p.is_claim_active = is_claim_active;
    });
  }

  void atom::changeoracle (
    const uint64_t& plan_index,
    const uint64_t& oracle_index
  ) {
    require_auth(get_self());
    auto plan = _plans.require_find(plan_index, "plan not found");
    _plans.modify(plan, same_payer, [&](auto& p) {
      p.oracle_index = oracle_index;
    });
  }

  void atom::changeprice (
    const uint64_t& stake_index,
    const double& oracle_price
  ) {
    require_auth(get_self());
    
    auto stake = _stakes.require_find(stake_index, "stake not found");
    _stakes.modify(stake, same_payer, [&](auto& s) {
      s.oracle_price = oracle_price;
    });
  }

  void atom::setplanstake (const uint64_t& plan_index, const bool& is_stake_active) {
    require_auth(get_self());

    auto plan = _plans.require_find(plan_index, "plan not found");
    _plans.modify(plan, same_payer, [&](auto& p) {
      p.is_stake_active = is_stake_active;
    });
  }

  void atom::setplanclaim (const uint64_t& plan_index, const bool& is_claim_active) {
    require_auth(get_self());

    auto plan = _plans.require_find(plan_index, "plan not found");
    _plans.modify(plan, same_payer, [&](auto& p) {
      p.is_claim_active = is_claim_active;
    });
  }

  void atom::startstake (
    const name& account,
    const uint64_t& plan_index,
    const asset& quantity
  ) {
    // Verification
    check(quantity.is_valid(), "invalid quantity");
    check(quantity >= MINIMUM_STAKE, "minimum stake quantity is " + MINIMUM_STAKE.to_string());

    // Find Plan
    auto plan = _plans.require_find(plan_index, "plan not found");
    check(plan->is_stake_active, "plan is not available to be staked to");

    // New Stake
    _stakes.emplace(get_self(), [&](auto& t) {
      t.index = _stakes.available_primary_key();
      t.plan_index = plan_index;
      t.account = account;
      t.start_time = current_time_point();
      t.staked = quantity;
      t.oracle_price = get_oracle_price(plan->oracle_index);
    });
  }

  void atom::claimstake (
    const name& account,
    const uint64_t stake_index
  ) {
    require_auth(account);

    // Find stake and plan
    auto stake = _stakes.require_find(stake_index, "stake not found");
    auto plan = _plans.require_find(stake->plan_index, "plan not found");

    // Validate
    check(plan->is_claim_active, "plan is not available to be claimed");
    check(stake->past_end_time(plan->plan_days), "stake has not ended yet.");
    check(account == stake->account, "invalid claiming account");

    // Calculate claimable amount
    auto claimable = stake->staked;
    claimable.amount = (stake->staked.amount * plan->multiplier) / MULTIPLIER_PRECISION;

    // Get oracle price
    double current_oracle_price = get_oracle_price(plan->oracle_index);
    double target_oracle_price = (stake->oracle_price * plan->multiplier) / MULTIPLIER_PRECISION;

    // Issue tokens if needed
    asset payout = asset(0, SYSTEM_TOKEN_SYMBOL);
    if (current_oracle_price < target_oracle_price) {
      // Calculate payout
      check(current_oracle_price != 0, "invalid current oracle price");
      double oracle_ratio = target_oracle_price / current_oracle_price;
      check(oracle_ratio < ORACLE_RATIO_MAX, "oracle ratio too high");
      payout.amount = static_cast<uint64_t>(oracle_ratio * stake->staked.amount);

      // Issue tokens
      uint64_t extra_payout_amount = payout.amount - stake->staked.amount;
      asset extra_payout = asset(extra_payout_amount, SYSTEM_TOKEN_SYMBOL);
      issue_action i_action(SYSTEM_TOKEN_CONTRACT, {SYSTEM_CONTRACT, SYSTEM_CONTRACT_PERMISSION} );
      i_action.send(SYSTEM_CONTRACT, extra_payout, "Long Stake Internal Tokens Issue");

      transfer_action t_action(SYSTEM_TOKEN_CONTRACT, {SYSTEM_CONTRACT, SYSTEM_CONTRACT_PERMISSION} );
      t_action.send(SYSTEM_CONTRACT, get_self(), extra_payout, "Long Stake Internal Transfer");
    } else {
      // Payout initial staked amount
      payout.amount = stake->staked.amount;
    }

    // Send out tokens
    transfer_action t_action(SYSTEM_TOKEN_CONTRACT, {get_self(), "active"_n} );
    t_action.send(get_self(), stake->account, payout, "Long Stake Claim Payout!");

    // Receipt
    stakereceipt_action sr_action(get_self(), {get_self(), "active"_n} );
    sr_action.send(*stake);

    // Erase stake
    _stakes.erase(stake);
  }

  void atom::cancelstake (
    const name& account,
    const uint64_t stake_index
  ) {
    require_auth(account);

    // Find stake and plan
    auto stake = _stakes.require_find(stake_index, "stake not found");
    auto plan = _plans.require_find(stake->plan_index, "plan not found");

    // Validate
    check(stake->past_end_time(plan->plan_days), "stake has not ended yet.");
    check(account == stake->account, "invalid claiming account");
    
    // Refund
    transfer_action t_action(SYSTEM_TOKEN_CONTRACT, {get_self(), "active"_n} );
    t_action.send(get_self(), stake->account, stake->staked, "Long Stake - Cancel Stake");

    // End stake
    _stakes.erase(stake);
  }

  double atom::get_oracle_price(const uint64_t& oracle_index) {
    auto d_table = data_table(ORACLE_CONTRACT, ORACLE_CONTRACT.value);
    auto oracle_data = d_table.require_find(oracle_index, "oracle not found");
    return oracle_data->aggregate.get<double>(); 
  }
} // namepsace contract