const { ethers } = require('hardhat');
const { expect, assert } = require('chai');
require('dotenv').config();

let SimpleStorageFactory = null;
let simpleStorage = null;

describe('SimpleStorage', () => {
	beforeEach(async function () {
		SimpleStorageFactory = await ethers.getContractFactory('SimpleStorage');

		simpleStorage = await SimpleStorageFactory.deploy();
	});

	it('Should start with a favorite number of 0', async function () {
		const currentValue = await simpleStorage.retrieve();
		const expectedValue = 0;

		console.log(`Current value: ${currentValue}`);

		assert.equal(
			currentValue.toString(),
			expectedValue,
			'The current value is not what was expected!'
		);
	});

	it('Should update when we call store', async function () {
		const expectedValue = '7';
		const transactionResponse = await simpleStorage.store(expectedValue);

		console.log('Waiting for network propagation...');
		await transactionResponse.wait(process.env.WAIT_BLOCKS);

		const updatedValue = await simpleStorage.retrieve();

		assert.equal(
			Number(updatedValue),
			Number(expectedValue),
			'The contract number was not updated accordingly!'
		);
		// Alternatively we can use 'expect' instead, which achieves essentially the same
		expect(Number(updatedValue)).to.equal(Number(expectedValue));
	});
});
