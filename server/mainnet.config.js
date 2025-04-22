const endpoints = [
  "https://rpc.api.mainnet.metalx.com",
  "https://api.protonnz.com",
  "https://proton.eosusa.io",
  "https://proton.cryptolions.io"
]
const accounts = [
  'bot1@active',
  'bot2@active',
  'bot3@active' ,
  'bot4@active'
]

module.exports = {
    apps : [
      {
        name: 'proton-longstaking-mainnet-bots',
        script: 'dist/index.js',
        node_args : '-r dotenv/config',
        watch: false,
        env: {
          'CHAIN': 'proton',
          'ORACLE_INDEX': 2,
          'ENDPOINTS': endpoints.join(','),
          'ACCOUNTS': accounts.join(','),
        }
      }
    ]
};