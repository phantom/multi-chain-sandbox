import { SupportedChainIcons, SupportedEVMChainIds } from '../types';
import getChainData from './getChainData';

const getChainIcon = (chainId: SupportedEVMChainIds): SupportedChainIcons => getChainData(chainId).icon;

export default getChainIcon;
