import { PhantomEthereumProvider, SupportedEVMChainIds } from '../types';

/**
 * Switches the ethereum provider to a new chainId
 * @param provider a Phantom ethereum provider
 * @param chainId an EVM chainId to switch to
 * @returns null if successful
 */
const switchEthereumChain = async (
  provider: PhantomEthereumProvider,
  chainId: SupportedEVMChainIds
): Promise<unknown> => {
  try {
    const response = await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
    return response;
  } catch (error) {
    console.warn(error);
    throw new Error(error.message);
  }
};

export default switchEthereumChain;
