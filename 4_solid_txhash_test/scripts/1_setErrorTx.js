var Counter = artifacts.require("Counter");

module.exports = async function(callback) {
    try {
        const s = await Counter.deployed();
        const accounts = await web3.eth.getAccounts();

        await s.inc(1, {from: accounts[1], gas: 0xfffff}),
        assert.equal(
            await s.value(),
            14,
            "oops"
        );
    }
    catch(error) {
        console.log("ERROR: ", error);
    }

    callback();
}