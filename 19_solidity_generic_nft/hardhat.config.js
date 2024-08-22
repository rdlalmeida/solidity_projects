/** @type import('hardhat/config').HardhatUserConfig */

require('dotenv').config();
require('@nomiclabs/hardhat-ethers');

const {ALCHEMY_API_ENDPOINT, METAMASK_PRIV_KEY} = process.env;

module.exports = {
  solidity: "0.8.24",
  defaultNework: "sepolia",
  networks: {
    hardhat: {},
    sepolia: {
      url: ALCHEMY_API_ENDPOINT,
      accounts: [`0x${METAMASK_PRIV_KEY}`],
      chainId: 11155111
    }
  }
};
