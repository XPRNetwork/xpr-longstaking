#pragma once

using namespace eosio;
using namespace std;

namespace proton {
  struct data_variant {
    optional<string> d_string;
    optional<uint64_t> d_uint64_t;
    optional<double> d_double;

    data_variant () {};
    data_variant (string val) { d_string = val; };
    data_variant (uint64_t val) { d_uint64_t = val; };
    data_variant (double val) { d_double = val; };
    
    bool operator < ( const data_variant& rhs ) const { return true; }
    bool operator > ( const data_variant& rhs ) const { return true; }

    string data_type ()const {
      if (d_string.has_value()) {
        return "string";
      } else if (d_uint64_t.has_value()) {
        return "uint64_t";
      } else if (d_double.has_value()) {
        return "double";
      } else {
        check(false, "invalid data_variant type");
        return {};
      }
    };

    template<typename T>
    T get ()const {
      string data_type = this->data_type();
      if constexpr (is_same<T, string>::value && data_type == "string") {
        return *d_string;
      } else if (is_same<T, uint64_t>::value && data_type == "uint64_t") {
        return *d_uint64_t;
      } else if (is_same<T, double>::value && data_type == "double") {
        return *d_double;
      } else {
        check(false, "invalid data_variant get");
        return {};
      }
    };

    EOSLIB_SERIALIZE( data_variant, (d_string)(d_uint64_t)(d_double) )
  };

  struct ProviderPoint {
    name provider;
    time_point time;
    data_variant data;

    EOSLIB_SERIALIZE( ProviderPoint, (provider)(time)(data) )
  };

  struct Data {
    uint64_t feed_index;
    data_variant aggregate;
    vector<ProviderPoint> points;

    uint64_t primary_key() const { return feed_index; };

    EOSLIB_SERIALIZE( Data, (feed_index)(aggregate)(points) )
  };
  typedef multi_index<"data"_n, Data> data_table;
}