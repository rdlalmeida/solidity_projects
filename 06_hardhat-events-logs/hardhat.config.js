require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
    networks: {
        dev: {
            url: process.env.PROVIDER_URL,
            accounts: [process.env.PROVIDER_PRIVATE_KEY],
            chainId: 1337,
        },
    },
    solidity: "0.8.18",
};
