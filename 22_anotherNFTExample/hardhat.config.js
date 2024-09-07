require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const { ALCHEMY_API_ENDPOINT, METAMASK_PRIV_KEY, ETHERSCAN_API_KEY } =
	process.env;
const {
	GANACHE_ACCOUNT_01,
	GANACHE_ACCOUNT_02,
	GANACHE_ACCOUNT_03,
	GANACHE_ACCOUNT_04,
} = process.env;

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
			accounts: [`0x${METAMASK_PRIV_KEY}`],
			chainId: 11155111,
		},
		ganache: {
			url: 'http://127.0.0.1:7545',
			chainId: 1337,
			// I don't need to set up this. I can run ethers.getSigners() and I get an array with all the addresses for the Ganache accounts
			// accounts: [
			// 	GANACHE_ACCOUNT_01,
			// 	GANACHE_ACCOUNT_02,
			// 	GANACHE_ACCOUNT_03,
			// 	GANACHE_ACCOUNT_04,
			// ],
		},
	},
	etherscan: {
		apiKey: {
			sepolia: ETHERSCAN_API_KEY,
		},
	},
};
