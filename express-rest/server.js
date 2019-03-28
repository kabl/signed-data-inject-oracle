var Web3 = require("web3");
var web3 = new Web3(Web3.givenProvider);
var express = require("express");
var app = express();
const axios = require("axios");

var oraclePrivKey = "OUR PRIVATE KEY";
var oracleAddress = "THE MATCHING ADDRESS";

app.get("/", async function(req, res) {

  var fxRateUsdEth = await getData();
  var timestamp = Math.floor(Date.now() / 1000);

  var hash = web3.utils.soliditySha3(
    web3.utils.toBN(fxRateUsdEth),
    web3.utils.toBN(timestamp)
  );

  var signature = web3.eth.accounts.sign(hash, oraclePrivKey);

  result = [];

  res.setHeader("Content-Type", "application/json");
  res.send(
    JSON.stringify({
      address: oracleAddress,
      signature: signature.signature,
      hash: hash,
      fxRateUsdEth: fxRateUsdEth,
      timestamp: timestamp
    })
  );
});

var server = app.listen(8081, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
});

const getData = async function() {
  console.log("getData called");
  try {
    var url = "https://api.kraken.com/0/public/Ticker?pair=ETHUSD";
    const response = await axios.get(url);
    const data = response.data;
    rate = data.result["XETHZUSD"].a[0] * 1000; //FX Rate has three decimals as smart contracts can not handle floating point numbers
    rate = Math.abs(rate);
    return rate;
  } catch (error) {
    console.log(error);
  }
};
