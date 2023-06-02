const EthereumEventProcessor = require("ethereum-event-processor");
const Web3 = require("web3");
const fs = require("fs");
require("dotenv").config();

const readContractABI = (contractABIPath) => {
    let contractABI;

    try {
        contractABI = JSON.parse(fs.readFileSync(contractABIPath));
    } catch (error) {
        console.error(error.message);
        process.exit();
    }
    return contractABI.abi;
};

const main = async function () {
    const web3ProviderUrl = process.env.PROVIDER_WEBSOCKET_URL;
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const contractABI = readContractABI(
        `${process.env.CONTRACT_ABI_PATH}${process.env.CONTRACT_ABI_FILE_NAME}`
    );

    const eventOptions = {
        pollingInterval: parseInt(process.env.EVENT_POOL_INTERVAL),
        startBlock: parseInt(process.env.EVENT_POOL_START_BLOCK),
        blocksToWait: parseInt(process.env.EVENT_BLOCKS_TO_WAIT),
        blocksToRead: parseInt(process.env.EVENT_BLOCKS_TO_READ),
    };

    const web3 = new Web3(
        new Web3.providers.WebsocketProvider(web3ProviderUrl)
    );

    const latestBlock = await web3.eth.getBlock("latest");

    eventOptions.startBlock = latestBlock.number;

    const eventListener = new EthereumEventProcessor(
        web3,
        contractAddress,
        contractABI,
        eventOptions
    );

    eventListener.on("NumberStored", async (event) => {
        console.log("Event Captured: ", event);
        console.log("Event return values: ", event.returnValues);
        eventListener.listen();
    });

    eventListener.listen();

    console.log("Event listener started...");
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
