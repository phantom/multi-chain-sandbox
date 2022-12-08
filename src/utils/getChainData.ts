import { SUPPORTED_CHAINS } from '../constants';
import { SupportedChainIcons, SupportedChainNames, SupportedEVMChainIds } from '../types';

/**
 * Returns a chain's name and icon if it supported by Phantom
 * @param chainId an EVM chain ID
 * @returns an object containing the chain's icon and a human-readable name
 */
const getChainData = (chainId: SupportedEVMChainIds): { name: SupportedChainNames; icon: SupportedChainIcons } => {
  if (!SUPPORTED_CHAINS[chainId]) {
    throw new Error(`Unsupported Chain ID: ${chainId}`);
  }
  return SUPPORTED_CHAINS[chainId];
};

export default getChainData;
