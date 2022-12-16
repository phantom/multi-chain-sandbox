import { PhantomInjectedProvider, TLog } from '../types';
import { PublicKey } from '@solana/web3.js';
import { getEthereumSelectedAddress } from './getEthereumSelectedAddress';

// MULTI-CHAIN PROVIDER TIP: Connect using the ethereum provider first for the best experience
// use onlyIfTrusted on the solana connect request, so we don't double pop up.
export const connect = async ({ solana, ethereum }: PhantomInjectedProvider, createLog: (log: TLog) => void) => {
  let wasEthereumConnected: boolean | undefined;
  try {
    wasEthereumConnected = !!await getEthereumSelectedAddress(ethereum);
    if (!wasEthereumConnected) {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      createLog({
        providerType: 'ethereum',
        status: 'success',
        method: 'eth_requestAccounts',
        message: `Connected to account ${accounts[0]}`,
      });
    }
  } catch (error) {
    createLog({
      providerType: 'ethereum',
      status: 'error',
      method: 'eth_requestAccounts',
      message: error.message,
    });
  }

  try {
    if (!wasEthereumConnected && !solana.isConnected) {
      // If ethereum was not connected then we would have showed the EVM pop up, so we should not show the solana pop up.
      await solana.connect({ onlyIfTrusted: true });
    } else if (wasEthereumConnected && !solana.isConnected) {
      // If ethereum was already connected, then we should show the pop up because the solana provider is not connected.
      await solana.connect();
    }
  } catch (error) {
    createLog({
      providerType: 'solana',
      status: 'error',
      method: 'connect',
      message: error.message,
    });
  }
};

// Similar to solana.connect({onlyIfTrusted: true}) but for multi-chain
// MULTI-CHAIN PROVIDER TIP: Must use the solana provider first, and only the call eth provider if the solana call is successful
export const silentlyConnect = async (
  {
    solana,
    ethereum,
  }: PhantomInjectedProvider,
  createLog: (log: TLog) => void,
) => {
  let solanaPubKey: { publicKey: PublicKey } | undefined;
  try {
    solanaPubKey = await solana.connect({ onlyIfTrusted: true });
  } catch (error) {
    createLog({
      providerType: 'solana',
      status: 'error',
      method: 'connect',
      message: 'encountered error while silent connecting: ' + error.message,
    });
  }

  if (solanaPubKey) {
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      createLog({
        providerType: 'ethereum',
        status: 'success',
        method: 'eth_requestAccounts',
        message: `Connected to account ${accounts[0]}`,
      });
    } catch (error) {
      createLog({
        providerType: 'ethereum',
        status: 'error',
        method: 'eth_requestAccounts',
        message: 'encountered error while silent connecting: ' + error.message,
      });
    }
  }
};