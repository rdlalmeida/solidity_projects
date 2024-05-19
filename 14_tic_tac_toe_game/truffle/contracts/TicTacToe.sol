// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/PullPayment.sol";

contract TicTacToe is PullPayment {
    event GameStarted(uint game_id);
    event GameWon(address winner, uint amount);

    event GameCreated(Game game);
    event GameEnded(Game game);

    event Checkpoint(string state);
    event CurrentGames(string location, Game[] games);

    struct Game {
        uint jackpot;
        address[2] payout_addresses;
        bool ended;
    }

    Game[] games;

    function startGame(address payout_x, address payout_o) public payable {
        // Must have some value attached for jackpot
        require(msg.value > 0, "Jackpot must be greater than 0!");

        // All params must be supplied
        require(payout_x != address(0), "Player X address cannot be empty!");
        require(payout_o != address(0), "Player O address cannot be empty!");

        // msg.sender and payout_o cannot be the same address
        require(
            payout_x != payout_o,
            "Player X and player O cannot have the same payout address!"
        );

        uint new_game_id = games.length;
        address[2] memory payout_addresses = [payout_x, payout_o];

        // The annoyance of developing in a fast changing language: the following statement was valid in early versions of Solidity, but at some point, adding a
        // new element to an array has to be done via the push instruction now

        // This one now throws an "Array out of bounds" Exception
        // games[new_game_id] = Game(msg.value, payout_addresses, false);

        // This one works for Solidity v0.8.20
        Game memory newGame = Game(msg.value, payout_addresses, false);
        games.push(newGame);

        emit GameStarted(new_game_id);

        // games.push(Game(msg.value, payout_addresses, false));
    }

    function endGame(uint game_id, uint winner) public {
        // Make sure the game hasn't already ended

        require(!games[game_id].ended);

        address winner_address = games[game_id].payout_addresses[winner];
        uint jackpot = games[game_id].jackpot;

        games[game_id].ended = true;

        _asyncTransfer(winner_address, jackpot);
        emit GameWon(winner_address, jackpot);
    }

    function getGamesState() public view returns (Game[] memory) {
        return games;
    }
}
