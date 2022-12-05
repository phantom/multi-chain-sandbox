import { SUPPORTED_CHAINS } from '../constants';
import { SupportedEVMChainIds } from '../types';

const getChainData = (chainId: SupportedEVMChainIds) => {
  if (!SUPPORTED_CHAINS[chainId]) {
    throw new Error(`Unsupported Chain ID: ${chainId}`);
  }
  return SUPPORTED_CHAINS[chainId];
};

export default getChainData;
