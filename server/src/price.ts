import fetch from 'node-fetch'
import Stats from './outlier'
import ccxt from 'ccxt'
import { rpc } from './index'

async function getAllOraclesData(
    lower_bound: any = undefined
): Promise<any> {
    try {
        const { rows, more, next_key } = await rpc.get_table_rows({
          code: "oracles",
          scope: "oracles",
          table: "data",
          limit: -1,
          lower_bound,
        });
        if (more) {
          const restOfRows: any = await getAllOraclesData(next_key);
          return rows.concat(restOfRows);
        } else {
          return rows;
        }
      } catch (e) {
        console.log(e);
        return [];
      }
}

const coingeckoApiKey = 'CG-QmWbqX1k4XY9FMXd1Mbm5cWY'

const xprBtcCoingecko = async () => {
    const res = await fetch(
       `https://pro-api.coingecko.com/api/v3/simple/price?ids=proton&vs_currencies=BTC&x_cg_pro_api_key=${coingeckoApiKey}`
    )
    const json = await res.json()
    return Number(json['proton']['btc'])
}

const xprBtcBithumb = async () => {
    const bithumb = new ccxt.bithumb()
    const xprKrw = await bithumb.fetchTicker('XPR/KRW')
    const btcKrw = await bithumb.fetchTicker('BTC/KRW')

    if (xprKrw.vwap && btcKrw.vwap) {
        return xprKrw.vwap / btcKrw.vwap
    } else if (xprKrw.close && btcKrw.close) {
        return xprKrw.close / btcKrw.close
    } else {
        return undefined
    }
}

const xprOracle = async () => {
    const oracles = await getAllOraclesData()
    const xprOracle = oracles.find((_: any) => _.feed_index === 3)
    const btcOracle = oracles.find((_: any) => _.feed_index === 4)
    return xprOracle.aggregate.d_double / btcOracle.aggregate.d_double
}

// const xprBtcHitbtc = async () => {
//     const hitbtc = new ccxt.hitbtc()
//     const xprBtc = await hitbtc.fetchTicker('XPR/BTC')
//     return xprBtc.vwap || xprBtc.close || xprBtc.last
// }

export const getXprBtcPrice = async () => {
    const prices = []
    const sources = [xprBtcCoingecko, xprBtcBithumb, xprOracle]

    // Get all prices
    for (const source of sources) {
        try {
            const price = await source()

            if (price && !isNaN(price) && price > 0) {
                prices.push(price)
            }
        } catch (e) {
            console.error(e)
        }
    }

    console.log('prices', prices)

    // Remove outliers
    const { outliers, notOutliers } = new Stats(prices).findOutliers()

    console.log('outliers', outliers)
    console.log('notOutliers', notOutliers)

    // Take mean
    const mean = new Stats(notOutliers).mean()
    console.log('XPR/BTC:', mean)

    return mean
}