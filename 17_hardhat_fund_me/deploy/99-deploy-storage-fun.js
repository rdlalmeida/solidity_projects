const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const TEST_STORAGE = Boolean(Number(process.env.TEST_STORAGE))

if (TEST_STORAGE) {
    module.exports = async ({ getNamedAccounts, deployments }) => {
        const { deploy, log } = deployments
        const { deployer } = await getNamedAccounts()

        log("----------------------------------------------------")
        log("Deploying FunWithStorage and waiting for confirmations...")
        const funWithStorage = await deploy("FunWithStorage", {
            from: deployer,
            args: [],
            log: true,
            // We need to wait if on a live network so we can verify properly
            waitConfirmations: network.config.blockConfirmations || 1,
        })

        if (
            !developmentChains.includes(network.name) &&
            process.env.ETHERSCAN_API_KEY
        ) {
            await verify(funWithStorage.address, [])
        }

        log("Logging storage...")
        for (let i = 0; i < 10; i++) {
            log(
                `Location ${i}: ${await ethers.provider.getStorage(
                    funWithStorage.address,
                    i
                )}`
            )

            // You can use this to trace!
            const trace = await network.provider.send(
                "debug_traceTransaction",
                [funWithStorage.transactionHash]
            )

            for (structLog in trace.structLog) {
                if (trace.structLog[structLog].op == "SSTORE") {
                    console.log(trace.structLog[structLog])
                }
            }
        }

        const firstElementLocation = ethers.keccak256(
            "0x0000000000000000000000000000000000000000000000000000000000000002"
        )

        const arrayElement = await ethers.provider.getStorage(
            funWithStorage.address,
            firstElementLocation
        )
        log(`Location ${firstElementLocation}: ${arrayElement}`)
        log(
            "-----------------------------------------------------------------------------"
        )
    }
} else {
    module.exports = async function () {}
}

module.exports.tags = ["all", "storage"]
