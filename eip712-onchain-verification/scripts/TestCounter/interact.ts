import { ethers } from "hardhat";
import { caller, counter } from "../../deploy/address.json"


async function main() {

  const Counter = await ethers.getContractAt("Counter",counter["address"]);
  const Caller = await ethers.getContractAt("Caller",caller["address"]);

  const counterContract = await Counter.getAddress();
  const _a = 22

  const result  = await Caller.trans(counterContract,_a,{ gasLimit: 55508 })
  const a = await Counter.a()
  console.log(a)

  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
