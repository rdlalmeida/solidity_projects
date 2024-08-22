async function main(run_env) {
    const MyNFT = await ethers.getContractFactory("MyNFT");

    // Start deployment, returning a promise that resolves to a contract object
    const myNFT = await MyNFT.deploy();
    await myNFT.deployed();
    console.log("Contract deployed to address: ", myNFT.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(hre)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
