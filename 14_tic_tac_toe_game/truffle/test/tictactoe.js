const TicTacToe = artifacts.require("TicTacToe");
const truffleAssert = require("truffle-assertions");

contract("TicTacToe", (accounts) => {
    // PRE-START
    it("Should not start a new game without a jackpot", async () => {
        // Wait for a deployed instance of the contract
        const ticTacToeInstance = await TicTacToe.deployed();

        await truffleAssert.reverts(
            ticTacToeInstance.startGame(accounts[0], accounts[1]),
            "Jackpot must be greater than 0"
        );
    });

    it("Should not start a new game with an empty payout_x address", async () => {
        const ticTacToeInstance = await TicTacToe.deployed();

        await truffleAssert.reverts(
            ticTacToeInstance.startGame(
                "0x0000000000000000000000000000000000000000",
                accounts[1],
                { value: 100 }
            ),
            "Player X address cannot be empty"
        );
    });

    it("Should not start a new game with an empty payout_o address", async () => {
        const ticTacToeInstance = await TicTacToe.deployed();

        await truffleAssert.reverts(
            ticTacToeInstance.startGame(
                accounts[0],
                "0x0000000000000000000000000000000000000000",
                { value: 100 }
            ),
            "Player O address cannot be empty"
        );
    });

    it("Should not start a new game with 2 equal payout addresses", async () => {
        const ticTacToeInstance = await TicTacToe.deployed();

        await truffleAssert.reverts(
            ticTacToeInstance.startGame(accounts[0], accounts[0], {
                value: 100,
            }),
            "Player X and player O cannot have the same payout address"
        );
    });

    // it("should not end game which has already ended", async () => {
    //     const ticTacToeInstance = await TicTacToe.deployed();

    //     const tx = await ticTacToeInstance.startGame(accounts[0], accounts[1], {
    //         value: 100,
    //     });

    //     await ticTacToeInstance.endGame(0, 0);

    //     await truffleAssert.reverts(
    //         ticTacToeInstance.endGame(0, 0),
    //         "cannot end a game which is already ended"
    //     );
    // });

    it("Should start a new game with all parameters supplied", async () => {
        const ticTacToeInstance = await TicTacToe.deployed();

        const tx = await ticTacToeInstance.startGame(accounts[0], accounts[1], {
            value: 100,
        });

        truffleAssert.eventEmitted(tx, "GameStarted");
    });

    it("Should end a game if one exists", async () => {
        const ticTacToeInstance = await TicTacToe.deployed();

        const tx = await ticTacToeInstance.endGame(0, 0);

        truffleAssert.eventEmitted(tx, "GameWon");
    });

    it("Should allow withdrawal if an address has winnings", async () => {
        const ticTacToeInstance = await TicTacToe.deployed();

        const oldBalance = await web3.eth.getBalance(accounts[1]);
        await ticTacToeInstance.withdrawPayments(accounts[1]);
        const newBalance = await web3.eth.getBalance(accounts[1]);

        assert.equal(
            parseInt(oldBalance) + 100,
            parseInt(newBalance),
            "Winner balance changed an unanticipated amount after withdrawal"
        );
    });
});
