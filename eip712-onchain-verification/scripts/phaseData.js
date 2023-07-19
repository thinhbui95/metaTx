const {constance} = require( "../utils/constances")
const { Web3 } = require('web3');


const getTxDetail = async (txhash) => {
    const web3 = new Web3("https://bsc-dataseed.binance.org/")
    const txDetail = await web3.eth.getTransaction(txhash)
    const receipt = await web3.eth.getTransactionReceipt(txhash)
    if (txDetail) {
      if (receipt) {
        txDetail.logs = receipt.logs
        txDetail.gasUsed = receipt.gasUsed
        txDetail.contractAddress = receipt.contractAddress
  
        txDetail.status = receipt.status ? constance[0].TX_STATUS_SUCCESS : constance[0].TX_STATUS_FAIL
        txDetail.fee =BigInt(txDetail.gasUsed) * BigInt(txDetail.gasPrice)
      } else {
        txDetail.status = constance.TX_STATUS_PENDING
      }
      if (txDetail.status === constance.TX_STATUS_FAIL) {
        try {
          web3.eth.handleRevert = true
          await web3.eth.call(txDetail, txDetail.blockNumber)
        } catch (err) {
          txDetail.failReason = err.reason
        }
        txDetail.input = txDetail.data
        txDetail.nonce = BigInt(txDetail.nonce)
        delete txDetail['data']
      }
      
    }
  
    return txDetail
  }

  const hashTx = "0xa826ea39430a7d77f1b0ba31eb0de9f54662c8a7b891ca0bec8affce96bbb312"

  const result = getTxDetail(hashTx)
  console.log(result)

