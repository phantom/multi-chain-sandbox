import { PhantomSolanaProvider } from '../types';

/**
 * Signs a message on Solana
 * @param   {PhantomSolanaProvider} provider a Phantom Provider
 * @param   {String}          message  a message to sign
 * @returns {Any}                      TODO(get type)
 */
const signMessageOnSolana = async (provider: PhantomSolanaProvider, message: string): Promise<string> => {
  try {
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await provider.signMessage(encodedMessage);
    return signedMessage;
  } catch (error) {
    console.warn(error);
    throw new Error(error.message);
  }
};

export default signMessageOnSolana;
