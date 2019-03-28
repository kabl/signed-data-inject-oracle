var dataVerifier = artifacts.require("./DataVerifier.sol");

module.exports = function(deployer) {
  deployer.deploy(dataVerifier);
};
