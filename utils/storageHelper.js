const BigNumber = require('bignumber.js');
const { ethers } = require('hardhat');
const leftPad = require('left-pad');

const standardizeInput = (input) => {
	leftPad(
		ethers.hexlify(ethers.toUtf8Bytes(input.toString())).replace('0x', ''),
		64,
		'0'
	);
};

const getMappingSlot = (mappingSlot, key) => {
	const mappingSlotPadded = standardizeInput(mappingSlot);
	const keyPadded = standardizeInput(key);
	const slot = ethers.keccak256(keyPadded.concat(mappingSlotPadded));

	return slot;
};

const getMappingStorage = async (address, mappingSlot, key) => {
	const mappingKeySlot = getMappingSlot(mappingSlot.toString(), key);
	const complexStorage = await ethers.provider.getStorage(
		address,
		mappingKeySlot
	);

	return complexStorage;
};

const getNestedMappingStorage = async (address, mappingSlot, key, key2) => {
	const nestedMappingSlot = getMappingSlot(mappingSlot.toString(), key);

	const nestedMappingValueSlot = getMappingSlot(nestedMappingSlot, key2);

	const nestedMappingValueStorage = await ethers.provider.getStorage(
		address,
		nestedMappingValueSlot
	);

	return {
		nestedMappingSlot,
		nestedMappingValueSlot,
		nestedMappingValueStorage,
	};
};

const getAllSimpleStorage = async (addr) => {
	let slot = 0;
	let zeroCounter = 0;
	const simpleStorage = [];

	// eslint-disable-next-line no-constant-condition

	while (true) {
		const data = await ethers.provider.getStorage(addr, slot);

		if (new BigNumber(data).equals(0)) {
			zeroCounter++;
		}

		simpleStorage.push({ slot, data });
		slot++;

		if (zeroCounter > 10) {
			break;
		}
	}

	return simpleStorage;
};

const getTrimmedStringFromStorage = (hex) => {
	return hex
		.slice(0, new BigNumber('0x' + hex.slice(-2)).add(2).toNumber())
		.toString();
};

const hexToASCII = (hex) => {
	var ascii = '';

	var i = 0;

	// DO NOT TRY TO CONVERT THE '0x' bit!!! Remove it if the string was included with it
	if (hex.slice(0, 2).toString() == '0x') {
		i = 2;
	}

	for (i; i < hex.length; i += 2) {
		var part = hex.substring(i, i + 2);

		var ch = String.fromCharCode(parseInt(part, 16));

		ascii = ascii + ch;
	}

	return ascii;
};

module.exports = {
	getAllSimpleStorage,
	getTrimmedStringFromStorage,
	hexToASCII,
	getMappingSlot,
	getMappingStorage,
	getNestedMappingStorage,
};
