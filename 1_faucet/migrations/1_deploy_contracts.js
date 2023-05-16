const owned = artifacts.require("../contracts/owned.sol");
const mortal = artifacts.require("../contracts/mortal.sol");
const Faucet = artifacts.require("../contracts/Faucet.sol");


module.exports = function (deployer) {
    deployer.deploy(owned);
    deployer.deploy(mortal);
    deployer.deploy(Faucet);
};