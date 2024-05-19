const EthereumEventProcessor = require("ethereum-event-processor");
require("dotenv").config();
const Web3 = require("web3");
const fs = require("fs");

const main = async function () {
    try {
        const event_name = "NumberChanged";

        const contract_json = JSON.parse(
            fs.readFileSync(process.env.CONTRACT_JSON_PATH)
        );

        const web3ProviderUrl = process.env.PROVIDER_WEBSOCKET_URL;
        const web3 = new Web3(
            new Web3.providers.WebsocketProvider(web3ProviderUrl)
        );

        const network_id = await web3.eth.net.getId();
        const simple_storage_contract_address =
            contract_json.networks[network_id].address;

        // const simple_storage_contract = new web3.eth.Contract(
        //     contract_json.abi,
        //     simple_storage_contract_address
        // );

        const event_options = {
            pollingInterval: parseInt(process.env.EVENT_POOL_INTERVAL),
            startBlock: parseInt(process.env.EVENT_POOL_START_BLOCK),
            blocksToWait: parseInt(process.env.EVENT_BLOCKS_TO_WAIT),
            blocksToRead: parseInt(process.env.EVENT_BLOCKS_TO_READ),
        };

        const latestBlock = await web3.eth.getBlock("latest");
        event_options.startBlock = latestBlock.number;

        const event_listener = new EthereumEventProcessor(
            web3,
            simple_storage_contract_address,
            contract_json.abi,
            event_options
        );

        event_listener.on(event_name, async (event) => {
            console.log("Captured this event: ", event);
            console.log("Return values from the event: ", event.returnValues);
        });

        event_listener.listen();

        console.log("Listener actively looking for ", event_name, " events...");
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
