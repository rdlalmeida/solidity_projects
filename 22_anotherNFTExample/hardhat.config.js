require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { ALCHEMY_API_ENDPOINT, METAMASK_PRIV_KEY, METAMASK_SEPOLIA_ACCOUNT } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    local: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: ALCHEMY_API_ENDPOINT,
      account: [`0x${METAMASK_PRIV_KEY}`],
      chainId: 11155111,
    }
  }
};
