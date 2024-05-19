var RoyalPets = artifacts.require("RoyalPets");

// More javascript voodoo: apparently, the deploy function "has" three arguments by default, that apparently may or may not be specified as the main function
// arguments, provided in this order: deployer, network and accounts
// deployer is an instance used to deploy the contract into the network
// network represents the chain to where the contract is going to de deployed
// accounts is a string array with all the account addresses configured

module.exports = function (deployer, network, accounts) {
    // The initialOwner address, which the RoyalPets constructor requires, can be obtained from the "deployer" object at deployer.options.from. Easy (kinda...)
    var initialOwner = deployer.options.from;

    deployer.deploy(RoyalPets, initialOwner);
};
