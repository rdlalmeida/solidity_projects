const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

/*
    Alternative way of calling the last thing:
    const helperConfig = require("../helper-hardhat-config")
    const networkConfig = helperConfig.networkConfig

    OR

    const networkConfig = require("../helper-hardhat-config").networkConfig
*/

module.exports = async (hre) => {
    /*
        Bellow is the functional equivalent to
        · a = hre.getNamedAccounts()
        · b = hre.deployments()
        Extracting these elements as such "renames" them to their element names as well. This is a Javascript "thing".
        Alternatively, there's even a shorter version of all this, namely:

        module.exports = async ({ getNamedAccounts, deployments }) => { FUNCTION_GOES_HERE}

        Javascript is so "smart" that it can infer where it should retrieve this elements from, namely, from 
        hre (hardhat runtime environment). The assumption is that no other variables exist with the same name.

    */
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // console.log("Current network: ", network)
    // console.log("Current network chain id: ", network.config.chainId)
    // console.log("Detected chainId = ", chainId)

    let ethUsdPriceFeedAddress

    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    console.log("Network config: ", networkConfig)

    const args = [ethUsdPriceFeedAddress]

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], // put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        developmentChains.includes(
            network.name && process.env.ETHERSCAN_API_KEY
        )
    ) {
        await verify(fundMe.address, args)
    }

    // Deploy the helper contract as well (for testing purposes)
    const fundMeHelper = await deploy("FundMeHelper", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // Verify this one as well (since we are at it)
    if (
        developmentChains.includes(
            network.name && process.env.ETHERSCAN_API_KEY
        )
    ) {
        await verify(fundMeHelper.address, args)
    }

    log("--------------------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
