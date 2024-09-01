const { ignition, ethers } = require("hardhat");
const { expect } = require("chai");

const ReceiveEthModule = require("../ignition/modules/05_ReceiveEthModule.js");

describe("ReceiveEth", () => {
    it("should deploy the contract and send its ETH", async () => {
        const { receiveEth } = await ignition.deploy(ReceiveEthModule);

        expect (await ethers.provider.getBalance(receiveEth)).to.equal(
            await receiveEth.amount()
        );
    });
});