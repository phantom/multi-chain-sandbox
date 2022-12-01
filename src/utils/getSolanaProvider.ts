import { PhantomSolanaProvider } from '../types';

/**
 * Retrieves the Phantom Solana Provider from the window object
 * @returns {PhantomSolanaProvider | undefined} a Phantom provider if one exists in the window
 */
const getSolanaProvider = (): PhantomSolanaProvider | undefined => {
  if ('phantom' in window) {
    const anyWindow: any = window;
    const provider = anyWindow.phantom?.solana;

    if (provider?.isPhantom) {
      return provider;
    }
  }

  window.open('https://phantom.app/', '_blank');
};

export default getSolanaProvider;
