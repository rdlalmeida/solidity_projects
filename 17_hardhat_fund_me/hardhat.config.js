const { setBlockGasLimit } = require("@nomicfoundation/hardhat-network-helpers")

require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomicfoundation/hardhat-chai-matchers")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

/** @type import('hardhat/config').HardhatUserConfig */

const SEPOLIA_ENDPOINT = process.env.SEPOLIA_ENDPOINT || ""
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || ""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const LOCAL_ENDPOINT = process.env.LOCAL_ENDPOINT || ""
const COINMARKET_API_KEY = process.env.COINMARKET_API_KEY || ""

module.exports = {
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.8.24" }],
    },
    defaultNetwork: "localhost",
    networks: {
        sepolia: {
            url: SEPOLIA_ENDPOINT,
            accounts: [SEPOLIA_PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },
        hardhat: {
            //url: LOCAL_ENDPOINT,
            chainId: 31337, // This is the chainId for the default Hardhat development network
            /* 
                NOTE: I was getting this stupid error at some point while running 'yarn hardhat coverage':

                    ProviderError: Transaction gas limit is 1099511627775 and exceeds block gas limit of 30000000

                This error means that the automatically estimated gas for that transaction 
                (by hardhat runtime environment I'm assuming...) exceeds the default value of 30M gas. How to solve this?
                Well, I need to extend the block gas limit, which is kinda normal once one starts dealing with long
                running and/or complex transactions. To do that, add the key-value bellow to extend the block gas limit
                for the network named 'hardhat'. As for the new value to extend, I just got the reported value from the error
                (1099511627775) and ceiled it to the nearest integer (1100000000000). Problem solved!
            */
            blockGasLimit: 1100000000000,
        },
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "EUR",
        coinmarketcap: COINMARKET_API_KEY,
        token: "MATIC",
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0, // This means: use accounts[0] as the account to deploy stuff, i.e., the deployer account
        },
        account1: {
            default: 1,
        },
        account2: {
            default: 2,
        },
    },
}
