import { PhantomEthereumProvider, SupportedEVMChainIds } from '../types';
import { useEffect, useState } from 'react';

/**
 * getes the ethereum provider to a new chainId
 * @param provider a Phantom ethereum provider
 * @param chainId an EVM chainId to get to
 * @returns null if successful
 */
const getEthereumChain = async (
  provider: PhantomEthereumProvider,
): Promise<SupportedEVMChainIds> => {
  try {
    const chainId = await provider.request({
      method: 'eth_chainId',
      params: [],
    });
    if (!Object.values(SupportedEVMChainIds).includes(chainId as SupportedEVMChainIds)) {
      throw new Error('got unexpected chain ID:' + chainId);
    }
    return chainId as SupportedEVMChainIds;
  } catch (error) {
    console.warn(error);
    throw new Error(error.message);
  }
};

export const useEthereumChainIdState = (provider: PhantomEthereumProvider | null) => {
  const [chainId, setChainId] = useState<SupportedEVMChainIds | undefined>(undefined);
  useEffect(() => {
    const f = async () => {
      if (!provider) {
        return;
      }
      const curChainId = await getEthereumChain(provider);
      setChainId(curChainId);
    };
    f();
  }, [provider]);

  return [chainId, setChainId] as const;
};

export default getEthereumChain;
