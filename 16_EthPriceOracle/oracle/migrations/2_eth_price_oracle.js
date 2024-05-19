const EthPriceOracle = artifacts.require("../contracts/EthPriceOracle.sol");

module.exports = function (deployer) {
    deployer.deploy(EthPriceOracle);
};
