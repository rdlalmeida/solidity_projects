const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainName = network.name

    if (developmentChains.includes(chainName)) {
        log("Local network detected! Deploying mocks...")

        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true, // This true flag instructs the deployer to spew out all deployment related info (Tx hash, deployment address, etc..)
            /*
                The constructor for the MockV3Aggregator requires two arguments, as indicated in the source code:
                From MockV3Aggregator.sol:
                
                (...)
                    constructor(uint8 _decimals, int256 _initialAnswer) {
                    decimals = _decimals;
                    updateAnswer(_initialAnswer);
                (...)

                The way this invocation works is by providing these elements inside the args array bellow. NOTE: The actual values
                were previously defined in the helper-hardhat-config.js
            */
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks deployed!")
        log(
            "--------------------------------------------------------------------"
        )
    }
}

module.exports.tags = ["all", "mocks", "main", "testnet"]
