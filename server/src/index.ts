import { Api, JsonRpc, JsSignatureProvider, Serialize } from '@protonprotocol/protonjs'
import fetch from 'node-fetch'
import { ENDPOINTS, PRIVATE_KEYS, BOTS_ACCOUNTS, ORACLE, ORACLE_CONTRACT } from './constants'

const rpc = new JsonRpc(ENDPOINTS, { fetch: fetch })
const api = new Api({ rpc, signatureProvider: new JsSignatureProvider(PRIVATE_KEYS as any) })

const wait = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const process = async (authorization: Serialize.Authorization) => {
  const price = await ORACLE.priceFunction()
  if (!price || price <= 0) {
    console.error('Oracle price is not correct')
    return
  }

  const actions = [{
    account: ORACLE_CONTRACT,
    name: 'feed',
    data: {
      account: authorization.actor,
      feed_index: ORACLE.oracleIndex,
      data: {
        d_string: undefined,
        d_uint64_t: undefined,
        d_double: price
      }
    },
    authorization: [{
      actor: authorization.actor,
      permission: authorization.permission
    }]
  }]

  try {
    const result = await api.transact({ actions }, {
      useLastIrreversible: true,
      expireSeconds: 400
    })
    return result
  } catch (e) {
    if (e.json && e.json.error && e.json.error.details) {
      console.error(e.json.error.details[0].message)
    } else {
      console.error(e)
    }
  }
}

const processor = async (authorization: Serialize.Authorization) => {
  process(authorization)
  await wait(ORACLE.waitTime)
  processor(authorization)
}

export const main = () => {
  for (const account of BOTS_ACCOUNTS) {
    processor(account)
  }
}

main()