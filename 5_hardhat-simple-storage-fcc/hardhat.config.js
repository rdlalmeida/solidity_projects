require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();
require('@nomiclabs/hardhat-etherscan');
require('./tasks/blockNumber');
require('./tasks/getAccounts');
require('./tasks/getNetworkChainId');
require('hardhat-gas-reporter');

/** @type import('hardhat/config').HardhatUserConfig */

const SEPOLIA_ENDPOINT =
	process.env.SEPOLIA_ENDPOINT || 'https://eth-sepolia/example';
const GANACHE_ENDPOINT =
	process.env.GANACHE_ENDPOINT || 'http://localhost:7545';
const LOCAL_ENDPOINT = process.env.LOCAL_ENDPOINT || 'http://localhost:8545';
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || '0xkey';
const GANACHE_PRIVATE_KEY = process.env.GANACHE_PRIVATE_KEY || '0xkey';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '0xkey';
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || '0xkey';

module.exports = {
	networks: {
		sepolia: {
			url: SEPOLIA_ENDPOINT,
			accounts: [SEPOLIA_PRIVATE_KEY],
			chainId: 11155111,
		},
		ganache: {
			url: GANACHE_ENDPOINT,
			accounts: [GANACHE_PRIVATE_KEY],
			chainId: 1337,
		},
		local: {
			url: LOCAL_ENDPOINT,
			// accounts: process.env.LOCAL_ACCOUNTS.trim()
			// 	.replace('\\n', '')
			// 	.split(','),
			// Got this chain id by running the custom task chain-id (check the code to see how this genius figured this out!)
			chainId: 31337,
		},
	},
	etherscan: {
		apiKey: ETHERSCAN_API_KEY,
	},
	gasReporter: {
		enabled: true,
		outputFile: 'gas-report.txt',
		noColors: true,
		currency: 'EUR',
		coinmarketcap: COINMARKETCAP_API_KEY,
		token: 'MATIC',
	},
	solidity: '0.8.18',
	defaultNetwork: process.env.CURRENT_ENVIRONMENT,
};
