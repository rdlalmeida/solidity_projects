// SPDX-License-Identifier: MIT

/*
	This contract is used to generate pseudo random numbers mainly based on the time in which this function is called, given that the main input into the random generator function is going to be the current timestamp, here provided using the 'now' function.

	This does not generate pure random number given that miners can manipulate the block timestamp, which is used as one of the seeds for the generator, and the internal seed used in this contract is not hard to determine too. But its more than enough for us to use.
*/
pragma solidity >=0.4.22 <0.9.0;

contract PseudoRandomGenerator {
	uint seed = 0;

	function generateRandomNumber(uint _modulus) public returns (uint) {
		uint randomVal = uint(keccak256(abi.encodePacked(block.timestamp, seed))) % _modulus;

		seed = randomVal;

		return randomVal;
	}
}
