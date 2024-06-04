// SPDX-License-Identifier: MIT
/*
	This is an implementation of the Battleship game using Ethereum Smart Contracts.
	The idea here is to enable the Battleship game in which two players using the same contract place ships in a NxN matrix. These ships are simply the cells where the value = 1. The rest of the cells represent water and have the value = 0.
	From there, players lauch "torpedoes", which are equivalent to naming the coordinates of a cell and check if a ship is in it or not, thus providing a hit or miss situation.
	For this to work, none of the players has access to the other's map, obviously, and they are limited to make guesses until they sunk the whole fleet, thus winning the game. In real life this is achieved by making sure your opponent cannot see your board (keep that sheet hidden) and the determination of a hit or miss is, mostly, dependent on the honest responses of each player. In reality, even if one player decides to "lie" by ignoring a hit from the other one, eventually his adversary is going to throw enough torpedoes into the field and realise that there's no way he has missed all ships so far. After all, ships are lines of '1's and there are a finite number of possible placements of these in any NxN matrix.

	In this smart contract, this behavior is achieved using Merkle Trees. Instead of saving the whole board in the contract, each player submits a Merkle tree root as his board. Hit and misses are determined by submitting a certain leaf for the tree, which corresponds to commiting a cell of that matrix to a value of 1, computing the proof and determining if the proof result matches the root or not, thus proving that the actual value of a cell is actually 1, confirming an hit.

	One of the problems here is to avoid cheating. If the root of the tree is calculated using only binary values, it is trivial for an adversary to determine the whole board, since each cell is always either 0 or 1. To prevent this, the calculation of the root requires adding "salt" to each cell value, which is nothing more than a random value to obfuscate the actual value. But to make this work, the value of this salt must be pre-defined, stored in the contract and unaccessible to regular players, only to the contract deployer. This means that the contract creator cannot play the game since he can access the random salt array and thus reveal the whole board of an adversary easily.

	The random salt array must be created at deploy time (use the constructor) and kept hidden from other players (make it private).

	Ricardo Lopes Almeida, Pisa, May 2023
*/
pragma solidity >=0.4.22 <0.9.0;

import "./PseudoRandomGenerator.sol";

contract Battleship {

	uint boardSize = 64;
	bytes32[64] saltVector;
	
	// constructor() public {
	// }

	// function generateSaltArray() private view returns (bytes32[64] memory) {
	// 	for (uint i = 0; i < boardSize; i++) {

	// 	}
	// }

	function generatePseudoRandomNumber(uint _modulus) internal returns (uint) {
		
	}
}
