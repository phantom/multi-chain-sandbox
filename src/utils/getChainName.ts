import { SupportedChainNames, SupportedEVMChainIds } from '../types';
import getChainData from './getChainData';

const getChainName = (chainId: SupportedEVMChainIds): SupportedChainNames => getChainData(chainId).name;

export default getChainName;
