const PseudoRandomGenerator = artifacts.require("../contracts/PseudoRandomGenerator");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("PseudoRandomGeneratorTest", function (/* accounts */) {
	let randomizer;
	var randomVal;
	let modulus = 100000;

	before(async () => {
		randomizer = await PseudoRandomGenerator.deployed();
	});

	it("Generating 20 random numbers:", async function () {
		for (i = 0; i < 10; i++) {
			// randomVal = await randomizer.generateRandomNumber.call(modulus);
			// console.log("Random value #", i, ": ", randomVal.toNumber());

			// randomVal = await randomizer.generateRandomNumber(modulus);
			// console.log("Random value #", i, ": ", randomVal);

			randomizer.generateRandomNumber.call(modulus).then(
				function (result) { 
					console.log("Random value #", 1, ": ", result.toNumber())
				});
		}

		return true;
	});
});
