import { Serialize } from "@protonprotocol/protonjs"
import { getXprBtcPrice } from "./price"

export const CHAIN = process.env.CHAIN
export const ORACLE_INDEX = process.env.ORACLE_INDEX
export const PRIVATE_KEYS = [process.env.PRIVATE_KEY]
if (!CHAIN) {
    console.error('No CHAIN provided')
    process.exit(0)
}
if (!ORACLE_INDEX) {
    console.error('No ORACLE_INDEX provided')
    process.exit(0)
}
if (!PRIVATE_KEYS.length) {
    console.error('No PRIVATE_KEY provided in .env')
    process.exit(0)
}

export const ENDPOINTS = CHAIN === 'proton'
    ? ["https://proton.eoscafeblock.com", "https://proton.eosusa.news", "https://proton.cryptolions.io", "https://proton.pink.gg", "https://proton.eoscafeblock.com"]
    : ["https://testnet.protonchain.com", "https://testnet.proton.pink.gg"]


export const ORACLE_CONTRACT = "oracles"
export const ORACLES: {
    [key: string]: {
        oracleIndex: number,
        waitTime: number,
        priceFunction: any
    }
} = CHAIN === 'proton'
    ? {
        2: { oracleIndex: 2, waitTime: 5 * 60 * 1000, priceFunction: getXprBtcPrice }
    }
    : {
        2: { oracleIndex: 2, waitTime: 5 * 60 * 1000, priceFunction: getXprBtcPrice }
    }

export const ORACLE = ORACLES[ORACLE_INDEX]
if (!ORACLE) {
    console.error(`No ORACLE DATA for index ${ORACLE_INDEX}`)
    process.exit(0)
}

export const BOTS_ACCOUNTS: Serialize.Authorization[] = []
if (!process.env.ACCOUNTS) {
    console.error('No ACCOUNTS provided')
    process.exit(0)
}
for (const accountPermission of process.env.ACCOUNTS.split(',')) {
    let [actor, permission] = accountPermission.split('@')
    if (!actor) {
        console.error('No actor provided')
        process.exit(0)
    }
    if (!permission) {
        permission = 'active'
    }
    BOTS_ACCOUNTS.push({ actor, permission })
}
console.log(BOTS_ACCOUNTS)