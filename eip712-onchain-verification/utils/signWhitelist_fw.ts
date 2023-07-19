import { signTypedData, SignTypedDataVersion, TypedMessage } from "@metamask/eth-sig-util";
import { EIP712Forward } from "../typechain-types";
import { Wallet } from "ethers";

export async function signWhitelist(
  wallet: Wallet,
  values: EIP712Forward.ForwardRequestStruct,
  chainId: number,
  verifyingContract: string
): Promise<string> {
  const data: TypedMessage<any> = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
      ],
      ForwardRequest: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "gas", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "data", type: "bytes" },
      ]
    },
    domain: {
      name: "test",
      version: "1.0.0",
      chainId,
      verifyingContract
    },
    primaryType: "ForwardRequest",
    message: values
  };

  const signature = signTypedData({
    privateKey: Buffer.from(wallet.privateKey.substring(2), "hex"),
    data,
    version: SignTypedDataVersion.V4
  });

  return signature;
}
