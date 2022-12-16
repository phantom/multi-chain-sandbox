import { PhantomEthereumProvider } from '../types';
import { getEthereumSelectedAddress } from './getEthereumSelectedAddress';

/**
 * Signs a message on Ethereum
 * @param provider a Phantom ethereum provider
 * @param message a message to sign
 * @returns a signed message is hex string format
 */
const signMessageOnEthereum = async (provider: PhantomEthereumProvider, message: string): Promise<string> => {
  try {
    const selectedAddress = await getEthereumSelectedAddress(provider);

    const signedMessage = await provider.request({
      method: 'personal_sign',
      params: [message, selectedAddress],
    });
    if (typeof signedMessage === 'string') return signedMessage;
    throw new Error('personal_sign did not respond with a signature');
  } catch (error) {
    console.warn(error);
    throw new Error(error.message);
  }
};

export default signMessageOnEthereum;
