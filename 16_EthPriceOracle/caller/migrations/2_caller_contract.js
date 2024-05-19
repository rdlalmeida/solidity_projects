const CallerContract = artifacts.require("../contracts/CallerContract.sol");

module.exports = function (deployer) {
    deployer.deploy(CallerContract);
};
