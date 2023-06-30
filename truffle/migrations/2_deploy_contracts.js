const nUSDStableCoin = artifacts.require("nUSDStableCoin");
module.exports = function(deployer) {
  deployer.deploy(nUSDStableCoin);
};
