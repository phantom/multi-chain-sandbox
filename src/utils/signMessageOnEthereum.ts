import { Web3Provider } from '@ethersproject/providers';

/**
 * Signs a message
 * @param   {Web3Provider} provider a Phantom Provider
 * @param   {String}          message  a message to sign
 * @returns {Any}                      TODO(get type)
 */
const signMessageOnEthereum = async (provider: Web3Provider, message: string): Promise<string> => {
  try {
    const signer = provider.getSigner();
    const signedMessage = await signer.signMessage(message);
    return signedMessage;
  } catch (error) {
    console.warn(error);
    throw new Error(error.message);
  }
};

export default signMessageOnEthereum;
