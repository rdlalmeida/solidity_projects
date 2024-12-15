const BigNumber = require('bignumber.js');
const chalk = require('chalk');
const util = require('util');
const { contractHelpers } = require('../../utils/contractHelper.js');
const {
	getAllSimpleStorage,
	getTrimmedStringFromStorage,
	hexToASCII,
} = require('../../utils/storageHelper.js');

const { assert } = require('chai');

let contractInstance, action;
let simpleStorage;
let contractAddress;
let constructorArguments;
let signers;
let owner, signer01, signer02;

const name = 'ExampleNFT';
const symbol = 'ENFT';

describe('When accessing ExampleNFT storage', () => {
	before('Setup contract', async () => {
		signers = await ethers.getSigners();
		owner = signers[0];
		signer01 = signers[1];
		signer02 = signers[2];

		constructorArguments = [owner.address, name, symbol];

		[contractInstance, action] = await contractHelpers.processContract(
			name,
			constructorArguments
		);
		contractAddress = await contractInstance.getAddress();

		simpleStorage = await getAllSimpleStorage(contractAddress);

		console.log(chalk.yellow('Storage: '));
		console.log(chalk.cyan(util.inspect(simpleStorage, false, null)));
	});

	it('Should have the name in slot 0', async () => {
		assert.equal(
			hexToASCII(getTrimmedStringFromStorage(simpleStorage[0].data)),
			name,
			'Name should be in slot 0'
		);
	});

	it('Should also have the size of name in slot 0 as well', async () => {
		// NOTE: The length of the string saved in storage is displayed in bytes but the length of the string itself (name.length) is in characters. But 1 character = 2 bytes (because ASCII saves 1 character using 16 bits, i.e., 2 bytes), so to compare these I need to divide one by 2 or multiply the other by 2
		// NOTE2: For Javascript to properly convert an hexadecimal string into decimal, it needs to understand that the string is an Hex one, i.e., the string needs to start by '0x'. The splice operation doesn't include that because it has no idea of what I'm trying to do, hence why I appended '0x' to the sliced part
		let num1 = Number('0x' + simpleStorage[0].data.slice(32)) / 2;
		let num2 = name.length;

		assert.equal(num1, num2, 'Name length should match!');
	});

	it('Should have the symbol in slot 1', async () => {
		assert.equal(
			hexToASCII(getTrimmedStringFromStorage(simpleStorage[1].data)),
			symbol,
			'Symbol should be in slot 1'
		);
	});

	it('Should also have the size of symbol in slot 1 as well', async () => {
		let num1 = Number('0x' + simpleStorage[1].data.slice(32)) / 2;
		let num2 = symbol.length;

		assert.equal(num1, num2, 'Symbol length should match!');
	});

	it('Should have the owner address in slot 7', async () => {
		// NOTE: I'm comparing both values as Numbers to get rid of the preceding zeros from the data retrieved from storage
		let storedAddress = Number(
			getTrimmedStringFromStorage(simpleStorage[7].data)
		);

		storedAddress = assert.equal(
			storedAddress,
			Number(owner.address),
			'The owner address should be in slot 7'
		);
	});
});
