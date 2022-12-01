import { PhantomEthereumProvider } from '../types';

/**
 * Retrieves the Phantom Ethereum Provider from the window object
 * @returns {PhantomEthereumProvider | undefined} a Phantom provider if one exists in the window
 */
const getEthereumProvider = (): PhantomEthereumProvider | undefined => {
  if ('phantom' in window) {
    const anyWindow: any = window;
    const provider = anyWindow.phantom?.ethereum;

    if (provider?.isPhantom) {
      return provider;
    }
  }

  window.open('https://phantom.app/', '_blank');
};

export default getEthereumProvider;
