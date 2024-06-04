let eventTester = artifacts.require("../contracts/EventTester.sol");

module.exports = (deployer) => {
    deployer.deploy(eventTester);
};