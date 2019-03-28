# Oracles

A short overview over Oracles and a proposal of a third approach. 
This article will cover the base technical aspects. We assume that all Oracles are "good". 

## Introduction 

An Ethereum Oracle is nothing else than a concept to inject data from outside Ethereum inside the Ethereum Blockchain. This could be exchange rates such as USDETH, weather data, flight delays and so on.

First of all the name Oracle is more confusing than helpful. It assumes that something magic will happen or that this technic is that amazing. This is not the case. 

Further more by using an Oracle the smart contract or the participants in the system will partially interact with a centralized system. This is nothing bad. For instance if you participate in an ICO/ITO/STO or whatever you trust the organization. Why also not trust their Oracle? The question is more is this clear communicated and do you as user have the possibility to make sure nobody is cheating you. 

## Types of Oracles

In the wild I saw two types of Oracles. I call them:
- Callback Oracle / 2TX Oracle
- Continuous injection Oracle

### Callback Oracle / 2TX Oracle

Callback Oracle working with two phases (therefore requires at least two transactions). If a smart contract requires some data it will call an oracle smart contract. The oracle smart contract then creates an event. As example: `oraclize_query(60, "URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0");` ([Sourc-code](http://dapps.oraclize.it/browser-solidity/#gist=9817193e5b05206847ed1fcd1d16bd1d&version=soljson-v0.5.3+commit.10d17f24.js)).
A service (off-chain) which is listening to events will get triggered and is executing the requested request. After that the listener service will create a transaction to the oracle smart contract to inject the result. 

[http://www.oraclize.it](http://www.oraclize.it/) have built such a solution.

The main problem here is, that whenever data is required, at least two transactions are required. Also the to original transaction creator has no chance to verify the injected data (or abort the injection).

Benefit:

- Data get injected when needed
- Flexibility. Different requests can be made

Drawback:

- Loosing TX context
- Complexity to handle in a smart contract multiple TXs.

### Continuous injection Oracle

This is a much simpler approach compared to the callback oracles. 
An outside service will periodically inject data into the smart contract. For example when the USDETH prices changed 1% in the last 10 minutes then update the exchange rate in the smart contract. That means the smart contract has always valid exchange rates. 

Benefit:

- Simple 

Drawback:

- Expensive data feed. GAS costs
- Overloading the Ethereum network

## New idea

### Signed data inject

This is (probably) a new approach how to inject data in a smart contract. 

- Smart contracts has a whitelist of trusted addresses
- Trusted data provider signs data: `signature = sign(hash(data, timestamp))`
- User gets the data from the trusted data providers API `{data, timestamp, signature}`
- User can validate the data. 
- User sends a transaction to the smart contract: `f(data, timestamp, signature)`
- Smart contract hashes the parameters and validates the signature. And checks the signer address with the list of trusted signer addresses. 

The timestamp is important that the smart contract can validate that not expired/old data is injected.

Benefit:

- Simple
- User is able to validate the data
- Flexible
- In case of fraud: Traceability 

Drawback:

- TBD

## Running Truffle tests

- Install truffle
- Install ganache-cli

```bash
# First time
npm install

# Terminal 1
ganache-cli

# Terminal 2
truffle test
```

## References
- https://github.com/kabl/solidity-signature-verify
- https://ethereum.stackexchange.com/questions/15364/ecrecover-from-geth-and-web3-eth-sign
- https://ropsten.etherscan.io/address/0x1d0d66272025d7c59c40257813fc0d7ddf2c4826#code
- https://ethereum.stackexchange.com/questions/13652/how-do-you-sign-an-verify-a-message-in-javascript-proving-you-own-an-ethereum-ad