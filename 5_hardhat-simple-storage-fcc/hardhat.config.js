require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();
require('@nomiclabs/hardhat-etherscan');
require('./tasks/blockNumber');
require('./tasks/getAccounts');
require('./tasks/getNetworkChainId');

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
	networks: {
		sepolia: {
			url: process.env.SEPOLIA_ENDPOINT,
			accounts: [process.env.SEPOLIA_PRIVATE_KEY],
			chainId: 11155111,
		},
		ganache: {
			url: process.env.GANACHE_ENDPOINT,
			accounts: [process.env.GANACHE_PRIVATE_KEY],
			chainId: 1337,
		},
		local: {
			url: process.env.LOCAL_ENDPOINT,
			// accounts: process.env.LOCAL_ACCOUNTS.trim()
			// 	.replace('\\n', '')
			// 	.split(','),
			// Got this chain id by running the custom task chain-id (check the code to see how this genius figured this out!)
			chainId: 31337,
		},
	},
	etherscan: {
		apiKey: process.env.ETHERSCAN_API_KEY,
	},
	solidity: '0.8.18',
	defaultNetwork: process.env.CURRENT_ENVIRONMENT,
};
