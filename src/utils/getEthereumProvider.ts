import { Web3Provider } from '@ethersproject/providers';
import { providers } from 'ethers';
import { PhantomEthereumProvider } from '../types';

/**
 * Retrieves the Phantom Ethereum Provider from the window object
 * @returns {PhantomEthereumProvider | undefined} a Phantom provider if one exists in the window
 */
const getEthereumProvider = (): PhantomEthereumProvider | undefined => {
  if ('phantom' in window) {
    const anyWindow: any = window;
    const ethereum = anyWindow.phantom?.ethereum;
    if (ethereum.isPhantom) {
      // const provider = new providers.Web3Provider(ethereum);
      // return provider;
      return ethereum;
    }
  }

  window.open('https://phantom.app/', '_blank');
};

export default getEthereumProvider;
