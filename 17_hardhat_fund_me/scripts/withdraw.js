const { getNamedAccounts, ethers, deployments } = require("hardhat")

async function main() {
    const accounts = await getNamedAccounts()

    const deployer = accounts.deployer
    await deployments.fixture(["all"])

    console.log("Instantiating contracts...")
    const fundMeInstance = await deployments.get("FundMe")
    const fundMeContract = await ethers.getContractAt(
        fundMeInstance.abi,
        fundMeInstance.address
    )

    console.log("Done!")

    console.log("Funding the contract..")
    var transactionResponse = await fundMeContract.fund({
        value: ethers.parseEther("0.13"),
    })
    var transactionReceipt = await transactionResponse.wait(1)

    console.log("Getting the contract's balance....")
    const balanceWei = await ethers.provider.getBalance(fundMeInstance.address)
    const balanceETH = ethers.formatEther(balanceWei.toString())
    console.log("Contract funded with %s ETH", balanceETH)

    console.log("Withdrawing funds...")
    transactionResponse = await fundMeContract.withdraw()
    transactionReceipt = await transactionResponse.wait(1)

    console.log("%s ETH withdrawn to account %s", balanceETH, deployer)
}

main()
    .then(() => {
        process.exit(0)
    })
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
