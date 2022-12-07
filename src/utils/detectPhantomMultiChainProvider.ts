import { PhantomInjectedProvider } from '../types';
import getEthereumProvider from './getEthereumProvider';
import getSolanaProvider from './getSolanaProvider';
import { Web3Provider } from '@ethersproject/providers';
import { providers } from 'ethers';

const TIMEOUT = 2000; // Two seconds

// TODO: Improve this, make it so it can detect Phantom when other wallets are installed
const detectPhantomMultiChainProvider = async (): Promise<PhantomInjectedProvider | null> => {
  const anyWindow: any = window;
  let hasBeenHandled = false;

  return new Promise((resolve) => {
    if (isPhantomAvailable()) {
      handleProvider();
    } else {
      anyWindow.addEventListener('phantom.ethereum#initialized', handleProvider, { once: true });
      anyWindow.addEventListener('load', handleIfPhantomIsAvailable, { once: true });
      document.addEventListener('DOMContentLoaded', handleIfPhantomIsAvailable, { once: true });
      setTimeout(() => {
        handleProvider();
      }, TIMEOUT);
    }

    function isPhantomAvailable() {
      if (anyWindow?.phantom?.ethereum?.isPhantom && anyWindow?.phantom?.solana?.isPhantom) return true;
      return false;
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

// const detectPhantomMultiChainProvider = async (): Promise<PhantomInjectedProvider | null> => {
//   const anyWindow: any = window;
//   const timeout = 2000;
//   let handled = false;

//   return new Promise((resolve) => {
//     if (anyWindow.ethereum) {
//       handleProviders();
//     } else {
//       anyWindow.addEventListener('ethereum#initialized', handleProviders, { once: true });
//       setTimeout(() => {
//         handleProviders();
//       }, timeout);
//     }

//     function handleProviders() {
//       if (handled) {
//         return;
//       }
//       handled = true;
//       anyWindow.removeEventListener('ethereum#initialized', handleProviders);

//       const { phantom } = anyWindow;

//       if (phantom) {
//         resolve(phantom);
//       } else {
//         const message = phantom ? 'Non-Phantom providers detected.' : 'Unable to detect window.ethereum.';
//         console.error(message);
//         resolve(null);
//       }
//     }
//   });
// };

export default detectPhantomMultiChainProvider;
