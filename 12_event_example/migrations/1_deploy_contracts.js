const EventExample = artifacts.require("../contracts/EventExample.sol");

module.exports = function (deployer) {
    deployer.deploy(EventExample);
};