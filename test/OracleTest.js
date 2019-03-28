'use strict';

const EthUtil = require('ethereumjs-util');
const Wallet = require('ethereumjs-wallet');

var DataVerifier = artifacts.require("./DataVerifier.sol");

var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

contract("OracleTest", accounts => {

  var user = accounts[3];
  var oracleAddress = "0xe4ea5296f1935a0e2818fd58f271b1909fb294f4";
  var oraclePrivKey = "0xd0c74533f8927627b535b152f209371d6f1ec02d20f647536e1f80f5c1ca3ed9"

  it("Private Key", async function() {;
    const privateKeyBuffer = EthUtil.toBuffer(oraclePrivKey);
    const wallet = Wallet.fromPrivateKey(privateKeyBuffer);
    const address = wallet.getAddressString();
  });

  it("Hashing test - web3 and contract hash", async function() {
    var instance = await DataVerifier.deployed();

    // 1.) Oracle provides and signs FX Rate
    var fxRateUsdEth = 130; // USDETH
    var timestamp = Math.floor(Date.now() / 1000);
    var hash = await instance.calcHash(fxRateUsdEth, timestamp);

    var hash2 = web3.utils.soliditySha3(
      web3.utils.toBN(fxRateUsdEth),
      web3.utils.toBN(timestamp)
    );

    assert.equal(hash, hash2);
  });

  it("Inject signed FX Rate - trusted Oracle", async function() {
    var instance = await DataVerifier.deployed();
    await instance.setTrustedOracle(oracleAddress);

    // 1.) Oracle provides and signs FX Rate
    var fxRateUsdEth = 130; // USDETH
    var timestamp = Math.floor(Date.now() / 1000);
    //var hash = await instance.calcHash(fxRateUsdEth, timestamp);
    var hash = web3.utils.soliditySha3(
      web3.utils.toBN(fxRateUsdEth),
      web3.utils.toBN(timestamp)
    );


    var signature = web3.eth.accounts.sign(hash, oraclePrivKey);
    
    // 2.) User inject signed FX Rate
    var result = await instance.verifySignature(
      fxRateUsdEth,
      timestamp,
      signature.signature,
      { from: user }
    );
    assert.equal(result.logs[0].event, "NewFxRateUsdEth");
    assert.equal(result.logs[0].args.data, 130);
  });


});
