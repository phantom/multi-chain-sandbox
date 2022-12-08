import { PhantomInjectedProvider } from '../types';

const TIMEOUT = 3000; // Three seconds

/**
 * Polls the `window` object for Phantom's ethereum and solana providers
 * @returns {Promise<PhantomInjectedProvider | null>} Phantom's ethereum and solana providers if they are found. These can also be found at window.ethereum and window.solana, respectively. Returns null if no providers are detected.
 */
const detectPhantomMultiChainProvider = async (): Promise<PhantomInjectedProvider | null> => {
  const anyWindow: any = window;
  let hasBeenHandled = false;

  return new Promise((resolve) => {
    if (isPhantomAvailable()) {
      // If Phantom is immediately detected, resolve it
      handleProvider();
    } else {
      // Listen for events that may indicate Phantom has been added to the window
      anyWindow.addEventListener('phantom.ethereum#initialized', handleProvider, { once: true });
      anyWindow.addEventListener('load', handleIfPhantomIsAvailable, { once: true });
      document.addEventListener('DOMContentLoaded', handleIfPhantomIsAvailable, { once: true });

      // Do a final check after time has passed
      setTimeout(() => {
        handleProvider();
      }, TIMEOUT);
    }

    function isPhantomAvailable() {
      return anyWindow?.phantom?.ethereum?.isPhantom && anyWindow?.phantom?.solana?.isPhantom;
    }

    function handleIfPhantomIsAvailable() {
      if (isPhantomAvailable()) {
        handleProvider();
      }
    }

    function handleProvider() {
      if (hasBeenHandled) return;
      hasBeenHandled = true;

      anyWindow.removeEventListener('phantom.ethereum#initialized', handleProvider);
      anyWindow.removeEventListener('load', handleIfPhantomIsAvailable);
      document.removeEventListener('DOMContentLoaded', handleIfPhantomIsAvailable);

      const { phantom } = anyWindow;

      if (phantom) {
        resolve(phantom);
      } else {
        const message = 'Unable to detect Phantom. Please make sure that Phantom is installed before proceeding.';
        console.error(message);
        resolve(null);
      }
    }
  });
};

export default detectPhantomMultiChainProvider;
