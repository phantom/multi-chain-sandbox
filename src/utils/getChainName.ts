import { SupportedChainNames, SupportedEVMChainIds } from '../types';
import getChainData from './getChainData';

/**
 * Returns a chain ID's name if it supported by Phantom
 * @param chainId an EVM chain ID
 * @returns a string representing the chain's human-readable name
 */
const getChainName = (chainId: SupportedEVMChainIds): SupportedChainNames => getChainData(chainId).name;

export default getChainName;
