const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")


/**
 * The following instructions call the buildModule function. This one requires a module ID ('SolidityNFT') and a call back function (the bit with (module) => {...})
 * The callback function is to be executed/called while providing an instance of the ModuleBuilder class, referred to as 'module'.
 * Certain instructions inside the callback function return 'Future' objects, which represent the result of an execution that is waiting for the function to be available once
 * the contract is deployed or an instance of a deployed contract is recovered.
 */
module.exports = buildModule("SolidityNFTDeployment", (module) => {
    
    const solidityNFTContract = module.contract("SolidityNFT", ["SolidityNFT", "SNFT"]);

    module.call(solidityNFTContract, "sayHello", ["Hi there!"]);

    return { solidityNFTContract };
});