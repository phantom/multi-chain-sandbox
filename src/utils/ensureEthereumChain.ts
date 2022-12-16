// Switches chain to the requested chain ID if necessary, rejects if unsuccessful.
import { PhantomEthereumProvider, SupportedEVMChainIds, TLog } from '../types';
import getEthereumChain from './getEthereumChain';
import switchEthereumChain from './switchEthereumChain';
import { getChainName } from './index';

export const ensureEthereumChain = async (
  provider: PhantomEthereumProvider,
  chainId: SupportedEVMChainIds,
  createLog: (log: TLog) => void,
): Promise<boolean> => {
  const curChainId = await getEthereumChain(provider);
  if (curChainId === chainId) {
    return true;
  }

  try {
    await switchEthereumChain(provider, chainId);
    createLog({
      providerType: 'ethereum',
      status: 'success',
      method: 'wallet_switchEthereumChain',
      message: `Switched to ${getChainName(chainId)} (Chain ID: ${chainId})`,
    });
    return true;
  } catch (error) {
    createLog({
      providerType: 'ethereum',
      status: 'error',
      method: 'wallet_switchEthereumChain',
      message: error.message,
    });
    return false;
  }
};