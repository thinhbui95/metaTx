import { ethers } from "hardhat";


async function main() {

  const factory = await ethers.getContractFactory("Counter");
  const Counter = await factory.deploy({ gasLimit: 4700000 });
  await Counter.waitForDeployment();
  console.log("Counter deployed to:", Counter.target);

  const caller = await ethers.getContractFactory("Caller")
  const callerContract = await caller.deploy({ gasLimit: 4700000 })
  await callerContract.waitForDeployment()
  console.log("Caller deployed to:", callerContract.target)

  const fs = require("fs");
  const rawData = fs.readFileSync("deploy/address.json");
  const oldAddresses = JSON.parse(rawData)

  const deployedAddresses = {
    ...oldAddresses,
    counter: {
      ...oldAddresses,
      "address":Counter.target
    },
    caller: {
        ...oldAddresses,
        "address":callerContract.target
    }
  };

    fs.writeFileSync("deploy/address.json", JSON.stringify(deployedAddresses, null, 2))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
