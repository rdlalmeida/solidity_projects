const { getNamedAccounts, ethers, deployments } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts().deployer
    const sendValue = ethers.parseEther("0.12")

    const reply = await deployments.fixture(["all"])

    const fundMeInstance = await deployments.get("FundMe")
    const fundMeContract = await ethers.getContractAt(
        fundMeInstance.abi,
        fundMeInstance.address
    )

    console.log("Funding Contract...")
    const transactionResponse = await fundMeContract.fund({ value: sendValue })
    const transactionReceipt = await transactionResponse.wait(1)

    console.log("Funded!")
}

main()
    .then(() => {
        process.exit(0)
    })
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
