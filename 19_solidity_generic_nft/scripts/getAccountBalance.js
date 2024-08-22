const{ ethers } = require("ethers");

async function main() {
    const networkProvider = ethers.getDefaultProvider("sepolia")

    const account_address = process.argv[2]

    var balance = await networkProvider.getBalance(account_address)

    balance = ethers.formatEther(balance)

    console.log("Account " + account_address + " balance is " + balance + " ETH")

    return balance
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })