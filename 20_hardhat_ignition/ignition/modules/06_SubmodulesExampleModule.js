const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const BasicDeploymentsModule = require("./01_BasicDeploymentsModule");

module.exports = buildModule("SubmodulesExample", (module) => {
    // You can import modules and use them as submodules with `module.useModule`.
    // Submodules allow you to reuse code and to organize your codebase.
    //
    // When you use a submodule, you get access to the contract futures
    // that it exports
    const { helloWorld } = module.useModule(BasicDeploymentsModule);

    // If you use a submodule more than once, you get the exact same
    // Futures as result
    const { helloWorld: helloWorldAlias } = module.useModule(BasicDeploymentsModule);

    console.log("Are these futures the same?", helloWorldAlias === helloWorld);

    // You can re-export futures from submodules
    return {
        helloWorld
    };
});