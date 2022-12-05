import { PhantomInjectedProvider } from '../types';

/**
 * Retrieves the Phantom's Solana and Ethereum providers from the window object
 * @returns {PhantomInjectedProvider | undefined} a Phantom provider if one exists in the window
 */
const getPhantomMultiChainProvider = (): PhantomInjectedProvider | undefined => {
  if ('phantom' in window) {
    const anyWindow: any = window;
    const provider = anyWindow.phantom;

    if (provider?.solana?.isPhantom && provider?.ethereum?.isPhantom) {
      return provider;
    }
  }

  window.open('https://phantom.app/', '_blank');
};

export default getPhantomMultiChainProvider;
