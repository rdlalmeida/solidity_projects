const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("BasicDeployments", (m) => {
	/**
	 * You can deploy a contract by calling the `contract` function
	 * and passing its name and constructor params.
	 * 
	 * The contract function returns a Future object, that represents
	 * the contract to be deployed.
	 * 
	 * Each Future has unique id, which is used to identify it, which
	 * Ignition normally autogenerates based on the contract name.
	 */
	const helloWorld = m.contract("HelloWorld", ["Hello, Ricardo!"]);

	// You can use Futures as arguments to create other Futures.
	const wrappedHelloWorld = m.contract("WrappedHelloWorld", [helloWorld]);

	// You can also deploy a contract from an artifact

	// In this case, we are deploying two instances of HelloWorld, so the
	// second one required an explicit id.
	const holaMundo = m.contract(
		"HelloWorld",
		// We require the artifacts for this example
		require("../../artifacts/contracts/01_BasicDeployment.sol/HelloWorld.json"),
		["Hola, mundo"],
		{ id: "HolaMundo" }
	);

	// Finally, you can return the contracts futures that you want to expose to
	// Ignition, tests, and other modules.
	return {
		helloWorld,
		wrappedHelloWorld,
		holaMundo
	};
});