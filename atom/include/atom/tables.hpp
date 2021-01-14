#pragma once

using namespace eosio;
using namespace std;

namespace proton {
  /**
   * PLAN
   */
  struct [[eosio::table, eosio::contract("atom")]] Plan {
    uint64_t index;
    uint64_t oracle_index;
    uint64_t plan_days;
    uint64_t multiplier;
    bool is_stake_active;
    bool is_claim_active;
    uint64_t primary_key() const { return index; };
  };
  typedef multi_index<"plans"_n, Plan> plan_table;

  /**
   * STAKE
   */
  struct [[eosio::table, eosio::contract("atom")]] Stake {
    uint64_t index;
    uint64_t plan_index;
    name account;
    time_point start_time;
    asset staked;
    double oracle_price;

    uint64_t by_account() const {return account.value;};
    uint64_t end_time(const uint64_t& plan_days) const { return start_time.sec_since_epoch() + (plan_days * SECONDS_PER_DAY); };
    bool past_end_time(const uint64_t& plan_days) const { return current_time_point().sec_since_epoch() >= end_time(plan_days); };
    uint64_t primary_key() const { return index; };
  };
  typedef multi_index< "stakes"_n, Stake,
    indexed_by<"byaccount"_n, const_mem_fun<Stake, uint64_t, &Stake::by_account>>
  > stake_table;
}