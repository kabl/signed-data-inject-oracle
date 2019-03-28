const EthUtil = require('ethereumjs-util');
const Wallet = require('ethereumjs-wallet');

var DataVerifier = artifacts.require("./DataVerifier.sol");

var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

contract("DataVerifierTest", accounts => {
  var address = accounts[0];
  var trustedOracle = accounts[1];
  var notTrustedOracle = accounts[2];
  var user = accounts[3];

  it("Inject signed FX Rate - trusted Oracle", async function() {
    var instance = await DataVerifier.deployed();
    await instance.setTrustedOracle(trustedOracle);

    // 1.) Oracle provides and signs FX Rate
    var fxRateUsdEth = 130; // USDETH
    var timestamp = Math.floor(Date.now() / 1000);
    var hash = await instance.calcHash(fxRateUsdEth, timestamp);
    var signature = await web3.eth.sign(hash, trustedOracle);

    // 2.) User inject signed FX Rate
    var result = await instance.verifySignature(
      fxRateUsdEth,
      timestamp,
      signature,
      { from: user }
    );
    assert.equal(result.logs[0].event, "NewFxRateUsdEth");
    assert.equal(result.logs[0].args.data, 130);
  });

  it("Inject signed FX Rate - not trusted Oracle", async function() {
    var instance = await DataVerifier.deployed();
    await instance.setTrustedOracle(trustedOracle);

    var fxRateUsdEth = 130; // USDETH
    var timestamp = Math.floor(Date.now() / 1000);
    var hash = await instance.calcHash(fxRateUsdEth, timestamp);
    var signature = await web3.eth.sign(hash, notTrustedOracle);
    //web3.utils.sha3(msg)

    try {
      await instance.verifySignature(fxRateUsdEth, timestamp, signature, {
        from: user
      });
      assert.fail("Exception expected one line before");
    } catch (err) {
      assert.isOk(err.toString().includes("wrong singer!"));
    }
  });
});
