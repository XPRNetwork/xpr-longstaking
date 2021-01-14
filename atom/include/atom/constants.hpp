#pragma once

using namespace eosio;
using namespace std;

#define ORACLE_CONTRACT name("oracles")
#define SYSTEM_CONTRACT name("eosio")
#define SYSTEM_CONTRACT_PERMISSION name("longstaking")
#define SYSTEM_TOKEN_CONTRACT name("eosio.token")
#define SYSTEM_TOKEN_SYMBOL symbol("XPR", 4)
#define MINIMUM_STAKE asset(100 * 10000, SYSTEM_TOKEN_SYMBOL) // 100 XPR
namespace proton
{
  static constexpr uint64_t SECONDS_PER_DAY = 86400;
  static constexpr double MULTIPLIER_PRECISION = 100;
  static constexpr double ORACLE_RATIO_MAX = 5.0;
} // namespace proton