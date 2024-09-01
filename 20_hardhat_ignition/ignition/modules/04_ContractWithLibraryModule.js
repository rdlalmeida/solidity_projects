const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ContractWithLibrary", (module) => {
    // To use a library, you first deploy it with `module.library`
    const library = module.library("BasicLibrary");

    // We then pass it as an option to `module.contract`
    const contractWithLibrary = module.contract("ContractWithLibrary", [], {
        libraries: { BasicLibrary: library },
    });

    return {
        contractWithLibrary,
    };
});