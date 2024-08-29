const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ContractFactory", (module) => {
    // We deploy the factory first
    const factory = module.contract("Factory");

    // Then call the deploy function
    const deploy = module.call(factory, "deploy");

    // The we read the address of the deployed contract from an event
    // emitted by deploy()

    const address = module.readEventArgument(deploy, "Deployed", "addr");

    // You can use 'contractAt' to get a contract Future for an existing contract
    const deployedWithFactory = module.contractAt("DeployedWithFactory", address);

    return {
        factory,
        deployedWithFactory,
    };
});