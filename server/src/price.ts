import fetch from 'node-fetch'
import Stats from './outlier'
import ccxt from 'ccxt'

const xprBtcCoingecko = async () => {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=proton&vs_currencies=BTC`)
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

const xprBtcHitbtc = async () => {
    const hitbtc = new ccxt.hitbtc()
    const xprBtc = await hitbtc.fetchTicker('XPR/BTC')
    return xprBtc.vwap || xprBtc.close || xprBtc.last
}

export const getXprBtcPrice = async () => {
    const prices = []
    const sources = [xprBtcCoingecko, xprBtcBithumb, xprBtcHitbtc]

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

    // Remove outliers
    const { notOutliers } = new Stats(prices).findOutliers()

    // Take mean
    const mean = new Stats(notOutliers).mean()
    console.log('XPR/BTC:', mean)

    return mean
}