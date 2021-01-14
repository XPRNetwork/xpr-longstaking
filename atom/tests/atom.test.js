const { loadConfig, Blockchain } = require("@klevoya/hydra");
const config = loadConfig("hydra.yml");

const LONG_STAKING = 'longstaking'

describe(LONG_STAKING, () => {
  let blockchain = new Blockchain(config);
  let staking = blockchain.createAccount(LONG_STAKING);
  let token = blockchain.createAccount(`eosio.token`);
  let oracles = blockchain.createAccount(`oracles`);
  let user = blockchain.createAccount(`user`);
  let oracle1 = blockchain.createAccount(`oracle1`);

  beforeAll(async () => {
    staking.setContract(blockchain.contractTemplates[LONG_STAKING]);
    staking.updateAuth(`active`, `owner`, { accounts: [{ permission: { actor: staking.accountName, permission: `eosio.code` }, weight: 1 }] });

    oracles.setContract(blockchain.contractTemplates[`oracles`]);

    token.setContract(blockchain.contractTemplates[`eosio.token`]);

    let eosio = blockchain.accounts.eosio
    eosio.updateAuth(`longstaking`, `active`, {
      threshold: 1,
      accounts: [
        {
          permission: {
            actor: staking.accountName,
            permission: `eosio.code`
          },
          weight: 1
        }
      ]
    });
    await eosio.contract.linkauth(
      {
        account: eosio.accountName,
        requirement: "longstaking",
        code: token.accountName,
        type: "issue"
      },
      [{ actor: eosio.accountName, permission: `active` }]
    );
    await eosio.contract.linkauth(
      {
        account: eosio.accountName,
        requirement: "longstaking",
        code: token.accountName,
        type: "transfer"
      },
      [{ actor: eosio.accountName, permission: `active` }]
    );
  });

  beforeEach(async () => {
    staking.resetTables();
    oracles.resetTables();

    token.resetTables();
    await token.loadFixtures();  

    blockchain.setCurrentTime(new Date())
  });

  it("Add Plan (addplan)", async () => {
    expect.assertions(1);

    const plan = {
      oracle_index: "0",
      plan_days: "1",
      multiplier: "150",
      is_stake_active: true,
      is_claim_active: true
    }
    await staking.contract.addplan(plan);

    expect(staking.getTableRowsScoped(`plans`)[LONG_STAKING]).toEqual(
      [{
        index: "0",
        ...plan
      }]
    );
  });

  it("Change Oracle (changeoracle)", async () => {
    expect.assertions(1);

    await staking.contract.addplan({
      oracle_index: "0",
      plan_days: "1",
      multiplier: "150",
      is_stake_active: true,
      is_claim_active: true
    });
    await staking.contract.changeoracle({
      plan_index: 0,
      oracle_index: 1
    });

    expect(staking.getTableRowsScoped(`plans`)[LONG_STAKING]).toEqual(
      [{
        index: "0",
        oracle_index: "1",
        plan_days: "1",
        multiplier: "150",
        is_stake_active: true,
        is_claim_active: true
      }]
    );
  });

  it("Pause Staking (setplanstake)", async () => {
    expect.assertions(1);

    await staking.contract.addplan({
      oracle_index: "0",
      plan_days: "1",
      multiplier: "150",
      is_stake_active: true,
      is_claim_active: true
    });
    await staking.contract.setplanstake({ plan_index: 0, is_stake_active: false });

    expect(staking.getTableRowsScoped(`plans`)[LONG_STAKING]).toEqual(
      [{
        index: "0",
        oracle_index: "0",
        plan_days: "1",
        multiplier: "150",
        is_stake_active: false,
        is_claim_active: true
      }]
    );
  });

  it("Pause Claiming (pausestakes)", async () => {
    expect.assertions(1);

    await staking.contract.addplan({
      oracle_index: "0",
      plan_days: "1",
      multiplier: "150",
      is_stake_active: true,
      is_claim_active: true
    });
    await staking.contract.setplanclaim({ plan_index: 0, is_claim_active: false });

    expect(staking.getTableRowsScoped(`plans`)[LONG_STAKING]).toEqual(
      [{
        index: "0",
        oracle_index: "0",
        plan_days: "1",
        multiplier: "150",
        is_stake_active: true,
        is_claim_active: false
      }]
    );
  });

  it("Start Stake (startstake)", async () => {
    expect.assertions(1);

    await oracles.contract.setfeed({
      account: user.accountName,
      index: null,
      name: 'XPR/BTC Oracle',
      description: 'XPR/BTC Oracle',
      aggregate_function: 'mean_median',
      data_type: 'double',
      config: [
        { key: 'data_window_size', value: 10 }
      ],
      providers: [oracle1.accountName]
    }, [{ actor: user.accountName, permission: 'active' }])

    await oracles.contract.feed({
      account: oracle1.accountName,
      feed_index: 0,
      data: {
        d_double: 0.000123,
        d_string: null,
        d_uint64_t: null
      }
    }, [{ actor: oracle1.accountName, permission: 'active' }])

    await staking.contract.addplan({
      oracle_index: "0",
      plan_days: "1",
      multiplier: "150",
      is_stake_active: true,
      is_claim_active: true
    });

    await token.contract.transfer({
      from: user.accountName,
      to: staking.accountName,
      quantity: '100.0000 XPR',
      memo: '0' // plan_index
    }, [{ actor: user.accountName, permission: 'active' }])

    const stakes = staking.getTableRowsScoped(`stakes`)[LONG_STAKING]
    expect(stakes).toEqual(
      [{
        index: "0",
        plan_index: "0",
        account: user.accountName,
        start_time: stakes[0].start_time,
        staked: '100.0000 XPR',
        oracle_price: 0.000123
      }]
    );
  });

  it("Claim Stake when XPR goes up 150% (no extra rewards) (claimstake)", async () => {
    expect.assertions(1);

    // Start oracle
    await oracles.contract.setfeed({
      account: user.accountName,
      index: null,
      name: 'XPR/BTC Oracle',
      description: 'XPR/BTC Oracle',
      aggregate_function: 'mean_median',
      data_type: 'double',
      config: [
        { key: 'data_window_size', value: 10 }
      ],
      providers: [oracle1.accountName]
    }, [{ actor: user.accountName, permission: 'active' }])

    // Feed data to oracle
    await oracles.contract.feed({
      account: oracle1.accountName,
      feed_index: 0,
      data: {
        d_double: 0.000123,
        d_string: null,
        d_uint64_t: null
      }
    }, [{ actor: oracle1.accountName, permission: 'active' }])

    // Add staking plan
    await staking.contract.addplan({
      oracle_index: "0",
      plan_days: "1",
      multiplier: "150",
      is_stake_active: true,
      is_claim_active: true
    });

    // Start stake
    await token.contract.transfer({
      from: user.accountName,
      to: staking.accountName,
      quantity: '100.0000 XPR',
      memo: '0' // plan_index
    }, [{ actor: user.accountName, permission: 'active' }])

    // 1 Day forward
    blockchain.setCurrentTime(new Date(new Date().getTime() + 60 * 60 * 24 * 1000))

    // Update oracle price
    await oracles.contract.feed({
      account: oracle1.accountName,
      feed_index: 0,
      data: {
        d_double: 0.000246,
        d_string: null,
        d_uint64_t: null
      }
    }, [{ actor: oracle1.accountName, permission: 'active' }])

    // Claim
    await staking.contract.claimstake({
      account: user.accountName,
      stake_index: "0"
    }, [{ actor: user.accountName, permission: 'active' }])

    const balances = token.getTableRowsScoped('accounts')[user.accountName]
    expect(balances).toEqual(
      [{
        balance: "1000000.0000 XPR"
      }]
    );
  });

  it("Claim Stake when XPR goes down 50% (3x rewards) (claimstake)", async () => {
    expect.assertions(1);

    // Start oracle
    await oracles.contract.setfeed({
      account: user.accountName,
      index: null,
      name: 'XPR/BTC Oracle',
      description: 'XPR/BTC Oracle',
      aggregate_function: 'mean_median',
      data_type: 'double',
      config: [
        { key: 'data_window_size', value: 10 }
      ],
      providers: [oracle1.accountName]
    }, [{ actor: user.accountName, permission: 'active' }])

    // Feed data to oracle
    await oracles.contract.feed({
      account: oracle1.accountName,
      feed_index: 0,
      data: {
        d_double: 0.000123,
        d_string: null,
        d_uint64_t: null
      }
    }, [{ actor: oracle1.accountName, permission: 'active' }])

    // Add staking plan
    await staking.contract.addplan({
      oracle_index: "0",
      plan_days: "1",
      multiplier: "150",
      is_stake_active: true,
      is_claim_active: true
    });

    // Start stake
    await token.contract.transfer({
      from: user.accountName,
      to: staking.accountName,
      quantity: '100.0000 XPR',
      memo: '0' // plan_index
    }, [{ actor: user.accountName, permission: 'active' }])

    // 1 Day forward
    blockchain.setCurrentTime(new Date(new Date().getTime() + 60 * 60 * 24 * 1000))

    // Update oracle price
    await oracles.contract.feed({
      account: oracle1.accountName,
      feed_index: 0,
      data: {
        d_double: 0.000001,
        d_string: null,
        d_uint64_t: null
      }
    }, [{ actor: oracle1.accountName, permission: 'active' }])

    // Claim
    await staking.contract.claimstake({
      account: user.accountName,
      stake_index: "0"
    }, [{ actor: user.accountName, permission: 'active' }])

    const balances = token.getTableRowsScoped('accounts')[user.accountName]
    expect(balances).toEqual(
      [{
        balance: "1000197.5806 XPR"
      }]
    );
  });
});
