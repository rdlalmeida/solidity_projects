const { contractHelpers } = require("./contractHelper.js");


async function main() {
    contractHelpers.saveContractAddress("hardhat", "AnotherNFT", "0x1234");
}


main()
    .then(() => {process.exit(0)})
    .catch((error) => {
        console.error(error);
        process.exit(1);
})