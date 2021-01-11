#pragma once

using namespace eosio;
using namespace std;

#define ORACLE_CONTRACT name("oracles")
#define SYSTEM_CONTRACT name("eosio")
#define SYSTEM_CONTRACT_PERMISSION name("longstaking")
#define SYSTEM_TOKEN_CONTRACT name("eosio.token")
#define SYSTEM_TOKEN_SYMBOL symbol("XPR", 4)

namespace proton
{
  static constexpr auto SECONDS_PER_DAY = 86400;
  static constexpr auto MULTIPLIER_PRECISION = 100;
} // namespace proton