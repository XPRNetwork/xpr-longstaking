const endpoints = [
  "https://testnet.protonchain.com",
  "https://testnet.proton.pink.gg"
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
        name: 'proton-longstaking-testnet-bots',
        script: 'dist/index.js',
        node_args : '-r dotenv/config',
        watch: false,
        env: {
          'CHAIN': 'proton-test',
          'ORACLE_INDEX': 2,
          'ENDPOINTS': endpoints.join(','),
          'ACCOUNTS': accounts.join(','),
        }
      }
    ]
};