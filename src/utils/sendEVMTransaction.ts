import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { utils } from 'ethers';

/**
 * Sends 1 wei to yourself
 * @param {Web3Provider} provider a web3 provider object
 * @returns {Promise<TransactionResponse>} a raw transaction object (hasn't been confirmed by network)
 */
async function sendEVMTransaction(provider: Web3Provider): Promise<TransactionResponse> {
  try {
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const gasPrice = await provider.getGasPrice();
    const transactionParameters = {
      nonce: await provider.getTransactionCount(address), // ignored by Phantom
      gasPrice, // customizable by user during confirmation.
      gasLimit: utils.hexlify(100000),
      to: address, // Required except during contract publications.
      from: address, // must match user's active address.
      value: utils.parseUnits('1', 'wei'), // Only required to send ether to the recipient from the initiating external account.
      data: '0x2208b07b3c285f9998749c90d270a61c63230983054b5cf1ddee97ea763d3b22', // optional arbitrary hex data
    };
    return signer.sendTransaction(transactionParameters);
  } catch (error) {
    console.warn(error);
    throw new Error(error.message);
  }
}

export default sendEVMTransaction;
