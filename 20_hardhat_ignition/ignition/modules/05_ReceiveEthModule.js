const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ReceiveEth", (module) => {
    const receiveEth = module.contract("ReceiveEth");

    // You can use `module.send` to send ETH to a contract.
    // The module won't be considered successfully executed until the send
    // is also executed.

    let valueToSend = BigInt(10**18);
    module.send("sendEth", receiveEth, valueToSend);

    return {
        receiveEth,
    };
});