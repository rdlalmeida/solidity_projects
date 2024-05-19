// NOTE: "require"s inside this file (hardhat.config.js) apparently are made available across to all project!
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

const local_endpoint = process.env.LOCAL_ENDPOINT;
const account0 = process.env.ACCOUNT0_PRIVATE_KEY;
const account1 = process.env.ACCOUNT1_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    networks: {
        // NOTE: This one is hardhat's default development network, i.e., the one created with the "$npx hardhat node" command
        // This network is created always in "http://localhost:8545", the configured accounts are the ones popping on the command line and, because of this,
        // there's no need for additional configuration. By naming one of these networks as "hardhat", it inherits all these characteristics by default.
        hardhat: {
            chainId: 31337,
        },
    },
    solidity: "0.8.20",
};
