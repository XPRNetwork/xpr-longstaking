# Proton Long Staking

## Directory
- atom: Long Staking Smart Contracts
- server: Oracle Feed for XPR/BTC

## Proposal
Reward long term holders with a defined minimum performance versus Bitcoin.

In Proof of Stake systems such as Proton, Tezos, Cosmos or EOS, selection of validators and hence security of the chain is done by rewarding longer term holders (stakers) with inflation block rewards. These rewards typically constitute of a total inflationary pool: currently in Proton, 2% of all inflation accrues to those who stake and vote.

With Bitcoin making significant strides, and now reaching new all time highs, Proton and other PoS chains find themselves competing for attention with Bitcoin itself. While our utility as a chain is entirely different (fast transactions, wrapped coins, free accounts, no fees etc…), we need a reward structure that is calibrated on BTC, not USD.

## Main Idea
Lock up tokens for an extended period and get a protected return denominated in BTC

## Oracles
In thinking this through, we came up with new cutting-edge tokenomics leveraging a 14-day weighted on-chain oracle average for the price of Proton in terms of Bitcoin.

We’ve built this oracle technology already and you can see it live at http://protonresources.com/bots. 

The oracle code is available at https://github.com/ProtonProtocol/proton-oracle.

## Mathematics
Now, given a daily close of O(x) of Proton in BTC, by “long staking” for 90 days, the contract will either return back
M = 105% * O(start)/O(end) as many proton XPR tokens as were staked. or the exact number of proton XPR tokens staked.

The amount returned depends only on whether M > 1 or not.

The advantage here from a tokenomics perspective is that the long stakers can be confident that over the long term (90 days or 1 year) they will always algorithmically out-perform the industry denominator: Bitcoin.

## Risks
While the long staker is given a higher amount of tokens at the end of his stake in the case of a BTC outperformance, there is no guarantee about the liquidity of tokens on markets. We’re using the word “calibrated” and certainly are not arguing that there are any guarantees.

The oracles are also very important. To reduce manipulation either at the entry or exit periods, we will be decentralizing the oracle process over the upcoming months. Without proper safeguards, the contract could end up minting large numbers of tokens which could affect total supply.
