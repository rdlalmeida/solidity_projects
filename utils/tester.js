const { contractHelpers } = require("./contractHelper.js");


async function main() {
    contractHelpers.getContractAddress("goerli", "UselessNFT");
}


main()
    .then(() => {process.exit(0)})
    .catch((error) => {
        console.error(error);
        process.exit(1);
})