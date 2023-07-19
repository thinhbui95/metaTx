import { ethers } from "hardhat";
import { signWhitelist} from "../../utils/signWhitelist_fw";
import { EIP712Forward} from "../../typechain-types";
import { eip712 } from "../../deploy/address_eip.json"
const Web3 = require('web3');
require("dotenv").config();

async function main() {
    const contract = await ethers.getContractAt("EIP712Forward",eip712["address"]);
    const contractTarget = "0xf542D5ff783a6c8E1c59117731567efbf42B9Bb3"
    const chainId = await ethers.provider.send("eth_chainId", []);
    const verifyingContract = await contract.getAddress();

    var private_key = process.env.PRI_KEY_2;
    const signer = new ethers.Wallet(private_key||"");

    var _a = 22;
    const data = Web3.eth.abi.encodeFunctionCall(
      {
        name: "increase",
        type: "function",
        inputs: [
          {
            type: "uint256",
            name: "myNumber",
          }
        ],
      },
      [_a]
    );
  console.log(data)

  const nonceNumber = await contract.getNonce(signer.address);
  console.log(nonceNumber)

  const values: EIP712Forward.ForwardRequestStruct = {
    from : signer.address ,   
    to :  contractTarget,
    value: 0,
    gas: 0,
    nonce: 0,
    data: data
  }

  const signature = await signWhitelist(signer, values, chainId, verifyingContract);
  const check = await contract.verify(values,signature);
  console.log(check)

  const resultHash = await  contract.execute(values,signature,{ gasLimit: 4700000 })
  console.log(resultHash)

}


main().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });