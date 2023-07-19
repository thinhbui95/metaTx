import { ethers } from "hardhat";


async function main() {
  const [account] = await ethers.getSigners();
  const factory = await ethers.getContractFactory("EIP712Forward");
  const name = "test"
  const version = "1.0.0"

  const eip712 = await factory.deploy(name, version,{ gasLimit: 4700000 });
  await eip712.waitForDeployment();

  console.log("EIP712Forward deployed to:", eip712.target);

  const fs = require("fs");
  const rawData = fs.readFileSync("deploy/address_eip.json");
  const oldAddresses = JSON.parse(rawData)

  const deployedAddresses = {
    ...oldAddresses,
    eip712: {
      ...oldAddresses,
      "address":eip712.target
    },
  };

    fs.writeFileSync("deploy/address_eip.json", JSON.stringify(deployedAddresses, null, 2))
  
}


main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
