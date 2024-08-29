/** @type import('hardhat/config').HardhatUserConfig */

require('dotenv').config();
require('@nomiclabs/hardhat-ethers');
require('@nomicfoundation/hardhat-ignition-ethers');

const {ALCHEMY_API_ENDPOINT, METAMASK_PRIV_KEY} = process.env;

module.exports = {
  solidity: "0.8.24",
  defaultNework: "sepolia",
  networks: {
    hardhat: {},
    sepolia: {
      // url: ALCHEMY_API_ENDPOINT,
      // accounts: [`0x${METAMASK_PRIV_KEY}`],
      url: "https://eth-sepolia.g.alchemy.com/v2/4M3GXFfdf0buuQ10GKoH2zA9mx2oqOQr",
      accounts: ["0x905579f4e781a6231504e6e4dd268d614ffef0692e2ba80849cd1cdf401a37c8"],
      chainId: 11155111
    }
  }
};
