import { PhantomEthereumProvider } from '../types';
import { useEffect, useState } from 'react';

export const getEthereumSelectedAddress = async (provider: PhantomEthereumProvider): Promise<string | undefined> => {
  const [address] = await provider.request({ method: 'eth_accounts', params: [] }) as (Array<string> | []);
  return address;
};

export const useEthereumSelectedAddress = (provider: PhantomEthereumProvider) => {
  const [selectedAddress, setSelectedAddress] = useState<string | undefined>(undefined);
  useEffect(() => {
    const f = async () => {
      if (!provider) {
        return;
      }
      const selectedAddress = await getEthereumSelectedAddress(provider);
      setSelectedAddress(selectedAddress);
    };
    f();
  }, [provider]);

  return [selectedAddress, setSelectedAddress] as const;
};