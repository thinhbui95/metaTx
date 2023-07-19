import { ethers } from "hardhat";
import { eip712 } from "../../deploy/address_eip.json"

async function main() {

  const factory = await ethers.getContractFactory("Example");
  const trustForwarder = eip712["address"];
  const contract = await factory.deploy(trustForwarder,{ gasLimit: 4700000 });
  await contract.waitForDeployment();

  console.log("contract deployed to:", contract.target);
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
