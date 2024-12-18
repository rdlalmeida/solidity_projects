const BigNumber = require('bignumber.js');
const { ethers } = require('hardhat');
const leftPad = require('left-pad');

const standardizeInput = (input) => {
	let cleanInput;
	let hexedInput;
	if (input.slice(0, 2) == '0x') {
		// The input is already 'hexed'
		cleanInput = input.replace('0x', '');
	} else {
		hexedInput = ethers.hexlify(ethers.toUtf8Bytes(input.toString()));
		cleanInput = hexedInput.replace('0x', '');
	}

	return leftPad(cleanInput, 32, '0');
};

const getMappingSlot = (mappingSlot, key) => {
	// const mappingSlotPadded = standardizeInput(mappingSlot);
	// const keyPadded = standardizeInput(key);
	// const slot = ethers.keccak256(keyPadded.concat(mappingSlotPadded));

	try {
		if (mappingSlot.slice(0, 2) == '0x') {
			mappingSlot = mappingSlot.replace('0x', '');
		}
	} catch (error) {
		// Don't do anything in this case. I just want to avoid crashing this when a non string is provided. These don't need any 0x removed from them
		console.error(
			'Current mapping is of type ',
			typeof mappingSlot.toString()
		);
	}

	try {
		if (key.slice(0, 2) == '0x') {
			key = key.replace('0x', '');
		}
	} catch (error) {
		console.error('Current key is of type ', typeof key.toString());
	}

	const paddedSlot = leftPad(mappingSlot, 64, '0');
	const paddedAddress = leftPad(key, 64, '0');

	// const concatenated = ethers.concat([paddedAddress, paddedSlot]);

	const concatenated = paddedAddress.concat(paddedSlot);

	const slot = ethers.keccak256(ethers.toUtf8Bytes(concatenated));

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

const findMappingStorage = async (address, key, startSlot, endSlot) => {
	const bigStart = startSlot.add ? startSlot : new BigNumber(startSlot);
	const bigEnd = endSlot.add ? endSlot : new BigNumber(endSlot);

	for (
		let mappingSlot = bigStart;
		mappingSlot.lt(bigEnd);
		mappingSlot = mappingSlot.add(1)
	) {
		const mappingValueSlot = getMappingSlot(mappingSlot.toString(), key);
		const mappingValueStorage = await ethers.provider.getStorage(
			address,
			mappingValueSlot
		);

		if (mappingValueStorage != '0x00') {
			return {
				mappingValueStorage,
				mappingValueSlot,
				mappingSlot,
			};
		}
	}

	return null;
};

const findNestedMappingStorage = async (
	address,
	key,
	key2,
	slotStart,
	slotEnd
) => {
	const bigStart = new BigNumber(slotStart);
	const bigEnd = new BigNumber(slotEnd);

	for (
		let mappingSlot = bigStart;
		mappingSlot.lt(bigEnd);
		mappingSlot = mappingSlot.add(1)
	) {
		const nestedMappingSlot = getMappingSlot(mappingSlot.toString(), key);
		const nestedMappingValueSlot = getMappingSlot(nestedMappingSlot, key2);

		const nestedMappingValueStorage = await ethers.provider.getStorage(
			address,
			nestedMappingValueSlot
		);

		if (nestedMappingValueStorage != '0x00') {
			return {
				nestedMappingValueStorage,
				mappingSlot,
				nestedMappingSlot,
				nestedMappingValueSlot,
			};
		}
	}

	return null;
};

module.exports = {
	getAllSimpleStorage,
	getTrimmedStringFromStorage,
	hexToASCII,
	getMappingSlot,
	getMappingStorage,
	getNestedMappingStorage,
	findMappingStorage,
	findNestedMappingStorage,
};
