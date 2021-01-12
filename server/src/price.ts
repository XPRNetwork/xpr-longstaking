import fetch from 'node-fetch'

export const getXprBtcPrice = async () => {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=proton&vs_currencies=BTC`)
    const json = await res.json()
    return json['proton']['btc']
}