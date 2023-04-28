var fibonacci = artifacts.require("Fibonacci");

module.exports = async function (callback) {
    try {
        const fib_contract = await fibonacci.deployed();
        let accounts = web3.eth.getAccounts();
        fib_contract.generateFib(process.argv[4], {from: accounts[0], gas: 0xfffff});

        console.log("Created a Fibonacci sequence for", process.argv[4], "elements");
    }
    catch(error) {
        console.log(error);
    }

    callback();
}