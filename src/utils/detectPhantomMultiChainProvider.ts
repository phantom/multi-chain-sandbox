import { PhantomMultiChainProvider } from '../types';

const detectPhantomMultiChainProvider = async (): Promise<PhantomMultiChainProvider | null> => {
  const anyWindow: any = window;
  const timeout = 2000;
  let handled = false;

  return new Promise((resolve) => {
    if (anyWindow.ethereum) {
      handleProviders();
    } else {
      anyWindow.addEventListener('ethereum#initialized', handleProviders, { once: true });
      setTimeout(() => {
        handleProviders();
      }, timeout);
    }

    function handleProviders() {
      if (handled) {
        return;
      }
      handled = true;
      anyWindow.removeEventListener('ethereum#initialized', handleProviders);

      const { phantom } = anyWindow;

      if (phantom) {
        resolve(phantom);
      } else {
        const message = phantom ? 'Non-Phantom providers detected.' : 'Unable to detect window.ethereum.';
        console.error(message);
        resolve(null);
      }
    }
  });
};

export default detectPhantomMultiChainProvider;
