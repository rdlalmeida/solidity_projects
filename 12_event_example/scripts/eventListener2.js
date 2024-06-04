console.log("Building new event example contract:");

await deployer.deploy(EventExample);

let builder = await BaseBuilder.at(EventExample.address);

builder.DataStored()
    .on('data', event => console.log(event));

await
builder.build();