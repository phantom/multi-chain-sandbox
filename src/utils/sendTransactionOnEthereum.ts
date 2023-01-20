import { PhantomEthereumProvider } from '../types';
import numToHexString from './numToHexString';
import { getEthereumSelectedAddress } from './getEthereumSelectedAddress';
import { ethers } from 'ethers';

/**
 * Sends a transaction of 1 wei to yourself
 * @param provider a Phantom ethereum provider
 * @param getTransactionParameters returns a Promise of the transaction parameters that will be sent to the transaction
 * @returns a transaction hash
 */
const sendTransactionOnEthereum = async (
  provider: PhantomEthereumProvider,
  getTransactionParameters = async () => {
    const selectedAddress = await getEthereumSelectedAddress(provider);
    /**
     * Required parameters for a simple transfer of 1 wei
     * Phantom will automatically handle nonce & chainId.
     * gasPrice will be handled by Phantom and customizable by end users during confirmation
     */
    return {
      from: selectedAddress, // must match user's active address
      to: selectedAddress, // required except during contract publications
      gas: numToHexString(30000), // the max amount of gas to be used in the tx
      value: numToHexString(1), // only required when transferring ether. in this case, send 1 wei
    };
  }
): Promise<string> => {
  try {
    const transactionParameters = await getTransactionParameters();
    const ethersProvider = new ethers.providers.Web3Provider(provider as ethers.providers.ExternalProvider);
    const txHash = ethersProvider.send('eth_sendTransaction', [transactionParameters]);
    if (typeof txHash === 'string') return txHash;
    throw new Error('did not get back a transaction hash');
  } catch (error) {
    console.warn(error);
    throw new Error(error.message);
  }
};

export default sendTransactionOnEthereum;
