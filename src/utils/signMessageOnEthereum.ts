import { Web3Provider } from '@ethersproject/providers';

/**
 * TODO
 */
const signMessageOnEthereum = async (provider: any, message: string): Promise<string> => {
  try {
    const signedMessage = await provider.request({
      method: 'personal_sign',
      params: [message, provider.selectedAddress],
    });
    return signedMessage;
  } catch (error) {
    console.warn(error);
    throw new Error(error.message);
  }
};

export default signMessageOnEthereum;
