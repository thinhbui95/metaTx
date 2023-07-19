import { ethers } from "ethers"

async function main() {
    const chainId = 3172
    const ws = "wss://goerli.infura.io/ws/v3/8cd0eba9c9624cd5998c165f1a826a6f"
    // const ws = "ws://localhost:1546"
    const provider = new ethers.WebSocketProvider(ws)


    provider
    .on("pending", tx => {
        provider.getTransaction(tx).then(function (transaction) {
            console.log(transaction);
        });
    })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});