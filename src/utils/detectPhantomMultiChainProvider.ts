import { PhantomInjectedProvider } from '../types';

const POLLING_INTERVAL = 1000; // One second
const MAX_POLLS = 5;

/**
 * Polls the `window` object for Phantom's ethereum and solana providers
 * @returns {Promise<PhantomInjectedProvider | null>} an object containing Phantom's ethereum and solana providers if they are found. Returns null if they are not found.
 */
const detectPhantomMultiChainProvider = async (): Promise<PhantomInjectedProvider | null> => {
  const anyWindow: any = window;
  let count = 0;

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (count === MAX_POLLS) {
        clearInterval(interval);
        resolve(null);
        window.open('https://phantom.app/', '_blank');
      }

      const provider = anyWindow.phantom;
      if (provider?.ethereum?.isPhantom && provider?.solana?.isPhantom) {
        clearInterval(interval);
        resolve(provider);
      }
      count++;
    }, POLLING_INTERVAL);
  });
};

export default detectPhantomMultiChainProvider;
