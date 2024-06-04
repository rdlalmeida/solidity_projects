const battleship = artifacts.require("../contracts/Battleship.sol");
const randomizer = artifacts.require("../contracts/PseudoRandomGenerator.sol");

module.exports = function(deployer) {
    deployer.deploy(battleship);
    deployer.deploy(randomizer);
};