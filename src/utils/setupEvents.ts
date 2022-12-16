import { PhantomInjectedProvider, SupportedEVMChainIds, TLog } from '../types';
import { PublicKey } from '@solana/web3.js';
import { getChainName } from './index';
import { silentlyConnect } from './connect';

export function setupEvents(
  { solana, ethereum }: PhantomInjectedProvider,
  createLog: (log: TLog) => void,
  setEthereumChainId: (chainId: SupportedEVMChainIds) => void,
  setEthereumSelectedAddress: (address: string) => void,
) {
  // handle solana `connect` event
  solana.on('connect', (publicKey: PublicKey) => {
    createLog({
      providerType: 'solana',
      status: 'success',
      method: 'connect',
      message: `Connected to account ${publicKey.toBase58()}`,
    });
  });

  // handle ethereum `connect` event
  ethereum.on('connect', (connectionInfo: { chainId: SupportedEVMChainIds }) => {
    createLog({
      providerType: 'ethereum',
      status: 'success',
      method: 'connect',
      message: `Connected to ${getChainName(connectionInfo.chainId)} (Chain ID: ${connectionInfo.chainId})`,
    });
  });

  // handle solana `disconnect` event
  solana.on('disconnect', () => {
    createLog({
      providerType: 'solana',
      status: 'warning',
      method: 'disconnect',
      message: '👋 Goodbye',
    });
  });

  // handle ethereum `disconnect` event
  ethereum.on('disconnect', () => {
    createLog({
      providerType: 'ethereum',
      status: 'warning',
      method: 'disconnect',
      message: '⚠️ Lost connection to the RPC',
    });
  });

  // handle ethereum `accountsChanged` event
  ethereum.on('accountsChanged', (newAccounts: string[]) => {
    // if we're still connected, Phantom will return an array with 1 account
    if (newAccounts.length > 0) {
      setEthereumSelectedAddress(newAccounts[0]);
      createLog({
        providerType: 'ethereum',
        status: 'info',
        method: 'accountsChanged',
        message: `Switched to account ${newAccounts[0]}`,
      });
    } else {
      /**
       * In this case dApps could...
       *
       * 1. Not do anything
       * 2. Only re-connect to the new account if it is trusted
       * 3. Always attempt to reconnect (NOT RECOMMENDED) MULTI-CHAIN PROVIDER TIP
       */

      createLog({
        providerType: 'solana',
        status: 'info',
        method: 'accountChanged',
        message: 'Attempting to switch accounts.',
      });

      // attempt to reconnect silently
      silentlyConnect({ solana, ethereum }, createLog);
    }
  });

  // handle solana accountChanged event
  solana.on('accountChanged', (publicKey: PublicKey | null) => {
    // if we're still connected, Phantom will pass the publicKey of the new account
    if (publicKey) {
      createLog({
        providerType: 'solana',
        status: 'info',
        method: 'accountChanged',
        message: `Switched to account ${publicKey.toBase58()}`,
      });
    } else {
      /**
       * In this case dApps could...
       *
       * 1. Not do anything
       * 2. Only re-connect to the new account if it is trusted
       * 3. Always attempt to reconnect (NOT RECOMMENDED) MULTI-CHAIN PROVIDER TIP
       */

      createLog({
        providerType: 'solana',
        status: 'info',
        method: 'accountChanged',
        message: 'Attempting to switch accounts.',
      });

      // attempt to reconnect silently
      silentlyConnect({ solana, ethereum }, createLog);
    }

    // handle ethereum chainChanged event
    ethereum.on('chainChanged', (chainId: SupportedEVMChainIds) => {
      setEthereumChainId(chainId);
      createLog({
        providerType: 'ethereum',
        status: 'info',
        method: 'chainChanged',
        message: `Switched to ${getChainName(chainId)} (Chain ID: ${chainId})`,
      });
    });
  });
}
