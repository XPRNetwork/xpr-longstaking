#pragma once

// Standard.
#include <vector>

// EOS
#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include <eosio/crypto.hpp>
#include <eosio/transaction.hpp>

// Local
#include "constants.hpp"
#include "tables.hpp"
#include "oracle/oracle.hpp"

using namespace eosio;
using namespace std;

namespace proton {
  CONTRACT atom : public contract {
  public:
    using contract::contract;

    atom( name receiver, name code, datastream<const char*> ds )
      : contract(receiver, code, ds),
        _plans(receiver, receiver.value),
        _stakes(receiver, receiver.value) {}

    ACTION addplan (
      const uint64_t& oracle_index,
      const uint64_t& plan_days,
      const float& multiplier,
      const bool& is_active
    );
    ACTION pauseplan (const uint64_t& plan_index);
    ACTION startstake (
      const name& account,
      const uint64_t& plan_index,
      const asset& quantity
    );
    ACTION claimstake (
      const name& account,
      const uint64_t stake_index
    );

    ACTION cleanup () {
      require_auth(get_self());
      
      plan_table db(get_self(), get_self().value);
      auto itr = db.end();
      while(db.begin() != itr){
        itr = db.erase(--itr);
      }

      stake_table db2(get_self(), get_self().value);
      auto itr2 = db2.end();
      while(db2.begin() != itr2){
        itr2 = db2.erase(--itr2);
      }
    }

    // This function will be called when the contract is notified of incoming or outgoing transfer actions from any contract
    [[eosio::on_notify("eosio.token::transfer")]]
    void ontransfer   ( const name& from,
                        const name& to,
                        const asset& quantity,
                        const string& memo );

    // Contract needs eosio.token::issue and eosio.token::transfer
    void issue( const name& to,
                const asset& quantity,
                const string& memo );

    // Action wrappers
    using transfer_action = action_wrapper<"transfer"_n, &atom::ontransfer>;
    using issue_action    = action_wrapper<"issue"_n,    &atom::issue>;

    // Initialize tables from tables.hpp
    plan_table _plans;
    stake_table _stakes;

  private:
    double get_oracle_price(const uint64_t& oracle_index);
  };
}