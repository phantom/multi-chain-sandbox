import { PhantomEthereumProvider } from '../types';

/**
 * Signs a message on Ethereum
 * @param provider a Phantom ethereum provider
 * @param message a message to sign
 * @returns a signed message is hex string format
 */
const signMessageOnEthereum = async (provider: PhantomEthereumProvider, message: string): Promise<string> => {
  try {
    const signedMessage = await provider.request({
      method: 'personal_sign',
      params: [message, provider.selectedAddress],
    });
    if (typeof signedMessage === 'string') return signedMessage;
  } catch (error) {
    console.warn(error);
    throw new Error(error.message);
  }
};

export default signMessageOnEthereum;
