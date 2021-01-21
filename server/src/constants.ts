import { Serialize } from "@protonprotocol/protonjs"
import { getXprBtcPrice } from "./price"

if (!process.env.CHAIN) {
    console.error('No CHAIN provided in *.config.js')
    process.exit(0)
}
if (!process.env.ORACLE_INDEX) {
    console.error('No ORACLE_INDEX provided in *.config.js')
    process.exit(0)
}
if (!process.env.PRIVATE_KEYS) {
    console.error('No PRIVATE_KEYS provided in .env')
    process.exit(0)
}
if (!process.env.ENDPOINTS) {
    console.error('No ENDPOINTS provided in *.config.js')
    process.exit(0)
}
export const CHAIN = process.env.CHAIN
export const ORACLE_INDEX = process.env.ORACLE_INDEX
export const PRIVATE_KEYS = process.env.PRIVATE_KEYS.split(',')
export const ENDPOINTS = process.env.ENDPOINTS.split(',')

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