const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")

module.exports = buildModule("DeploymentPlusInitialization", (module) => {
    // Ignition also allows you to run complex initialization logic after deploying
    // your contracts, and preform any kind of operation on them.
    //
    // In this example we first deploy a contract, and then we call its `initialize`
    // function
    const helloWorld = module.contract("HelloWorldWithInitialize");

    // module.call returns a Future that represents the call to the contract.
    // Ignition won't consider the deployment finished until all the calls
    // have been executed.
    module.call(helloWorld, "initialize", ["Hello, bitch!"]);

    return {
        helloWorld,
    };
});