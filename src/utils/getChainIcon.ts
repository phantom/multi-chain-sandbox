import { SupportedChainIcons, SupportedEVMChainIds } from '../types';
import getChainData from './getChainData';

/**
 * Returns a chain's icon if it supported by Phantom
 * @param chainId an EVM chain ID
 * @returns the absolute path to the chain's icon in PNG format
 */
const getChainIcon = (chainId: SupportedEVMChainIds): SupportedChainIcons => getChainData(chainId).icon;

export default getChainIcon;
