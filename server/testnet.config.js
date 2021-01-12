module.exports = {
    apps : [
      {
        name: 'proton-longstaking-bots',
        script: 'dist/index.js',
        node_args : '-r dotenv/config',
        watch: false,
        env: {
          'CHAIN': 'proton-test',
          'ORACLE_INDEX': 2
        }
      }
    ]
};