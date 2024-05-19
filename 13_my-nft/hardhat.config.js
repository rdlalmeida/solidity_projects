// require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

const API_URL = process.env.API_URL;
const METAMASK_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.22",
    defaultNetwork: "sepolia",
    networks: {
        hardhat: {},
        sepolia: {
            url: API_URL,
            accounts: [`0x${METAMASK_PRIVATE_KEY}`],
        },
    },
};
