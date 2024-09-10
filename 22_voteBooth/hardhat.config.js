require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const { ALCHEMY_API_ENDPOINT, SEPOLIA_ACCOUNT01_PRIV, ETHERSCAN_API_KEY } =
	process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: '0.8.24',
	networks: {
		local: {
			url: 'http://127.0.0.1:8545',
			chainId: 31337,
		},
		sepolia: {
			url: ALCHEMY_API_ENDPOINT,
			accounts: [`0x${SEPOLIA_ACCOUNT01_PRIV}`],
			chainId: 11155111,
		},
		ganache: {
			url: 'http://127.0.0.1:7545',
			chainId: 1337,
		},
	},
	etherscan: {
		apiKey: {
			sepolia: ETHERSCAN_API_KEY,
		},
	},
};
