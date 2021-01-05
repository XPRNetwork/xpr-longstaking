#include <atom/atom.hpp>

namespace proton {
  void atom::ontransfer (const name& from, const name& to, const asset& quantity, const string& memo) {
    // Skip if outgoing
    if (from == get_self()) {
      return;
    }

    // Skip if deposit from system accounts
    if (from == "eosio.stake"_n || from == "eosio.ram"_n || from == SYSTEM_CONTRACT) {
      return;
    }

    // Validate transfer
    check(to == get_self(), "Invalid Deposit");
    check(get_first_receiver() == SYSTEM_TOKEN_CONTRACT, "only eosio.token tokens are supported");
    check(quantity.symbol == SYSTEM_TOKEN_SYMBOL, "only XPR symbol is supported");
    
    // Long stake
    startstake(from, stoull(memo), quantity);
  }
}