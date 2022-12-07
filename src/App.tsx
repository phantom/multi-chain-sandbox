/**
 * @DEV: If the sandbox is throwing dependency errors, chances are you need to clear your browser history.
 * This will trigger a re-install of the dependencies in the sandbox – which should fix things right up.
 * Alternatively, you can fork this sandbox to refresh the dependencies manually.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';

import {
  createTransferTransactionV0,
  pollSolanaSignatureStatus,
  sendTransactionOnEthereum,
  signAndSendTransactionOnSolana,
  signMessageOnEthereum,
  signMessageOnSolana,
} from './utils';

import {
  PhantomEthereumProvider,
  PhantomInjectedProvider,
  SupportedChainNames,
  SupportedEVMChainIds,
  PhantomProviderType,
  TLog,
  SupportedSolanaChainIds,
} from './types';

import { Logs, Sidebar, NoProvider } from './components';
import detectPhantomMultiChainProvider from './utils/detectPhantomMultiChainProvider';
import getPhantomMultiChainProvider from './utils/getPhantomMultiChainProvider';
import { SUPPORTED_CHAINS, SUPPORTED_ETHEREUM_CHAIN_IDS } from './constants';
import getChainName from './utils/getChainName';
import switchEthereumChain from './utils/switchEthereumChain';
import pollEthereumTransactionReceipt from './utils/pollEthereumTransactionReceipt';

// =============================================================================
// Styled Components
// =============================================================================

const StyledApp = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// =============================================================================
// Constants
// =============================================================================

const solanaNetwork = clusterApiUrl('devnet');
const connection = new Connection(solanaNetwork);
const message = 'To avoid digital dognappers, sign below to authenticate with CryptoCorgis.';

// =============================================================================
// Typedefs
// =============================================================================

export type ConnectedAccounts = {
  solana: PublicKey | null;
  ethereum: string | null;
};

export type ConnectedMethods =
  | {
      chain: string;
      name: string;
      onClick: (props?: any) => Promise<string>;
    }
  | {
      chain: string;
      name: string;
      onClick: (chainId?: any) => Promise<void | boolean>;
    };

interface Props {
  connectedAccounts: ConnectedAccounts;
  connectedEthereumChainId: SupportedEVMChainIds | null;
  connectedMethods: ConnectedMethods[];
  handleConnect: () => Promise<void>;
  logs: TLog[];
  clearLogs: () => void;
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * @DEVELOPERS
 * The fun stuff!
 */
const useProps = (provider: PhantomInjectedProvider | null): Props => {
  const [logs, setLogs] = useState<TLog[]>([]);

  const createLog = useCallback(
    (log: TLog) => {
      return setLogs((logs) => [...logs, log]);
    },
    [setLogs]
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, [setLogs]);

  /** Side effects to run once providers are detected */
  useEffect(() => {
    if (!provider) return;
    const { solana, ethereum } = provider;

    // attempt to eagerly connect
    solana.connect({ onlyIfTrusted: true }).catch(() => {
      // fail silently
    });

    solana.on('connect', (publicKey: PublicKey) => {
      createLog({
        providerType: 'solana',
        status: 'success',
        method: 'connect',
        message: `Connected to account ${publicKey.toBase58()}`,
      });
    });

    ethereum.on('connect', (connectionInfo: { chainId: SupportedEVMChainIds }) => {
      createLog({
        providerType: 'ethereum',
        status: 'success',
        method: 'connect',
        message: `Connected to ${getChainName(connectionInfo.chainId)} (Chain ID: ${connectionInfo.chainId})`,
      });
    });

    solana.on('disconnect', () => {
      createLog({
        providerType: 'solana',
        status: 'warning',
        method: 'disconnect',
        message: '👋 Goodbye',
      });
    });

    ethereum.on('disconnect', () => {
      createLog({
        providerType: 'ethereum',
        status: 'warning',
        method: 'disconnect',
        message: '⚠️ Lost connection to the RPC',
      });
    });

    ethereum.on('accountsChanged', (newAccounts: String[]) => {
      if (newAccounts.length > 0) {
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
         * 2. Always attempt to reconnect
         */

        createLog({
          providerType: 'ethereum',
          status: 'info',
          method: 'eth_requestAccounts',
          message: 'Attempting to switch accounts.',
        });

        ethereum.request({ method: 'eth_requestAccounts' }).catch((error) => {
          createLog({
            providerType: 'ethereum',
            status: 'error',
            method: 'eth_requestAccounts',
            message: `Failed to re-connect: ${error.message}`,
          });
        });
      }
    });

    solana.on('accountChanged', (publicKey: PublicKey | null) => {
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
         *
         * ```
         * solanaProvider.connect({ onlyIfTrusted: true }).catch((err) => {
         *  // fail silently
         * });
         * ```
         *
         * 3. Always attempt to reconnect
         */

        createLog({
          providerType: 'solana',
          status: 'info',
          method: 'accountChanged',
          message: 'Attempting to switch accounts.',
        });

        solana.connect().catch((error) => {
          createLog({
            providerType: 'solana',
            status: 'error',
            method: 'accountChanged',
            message: `Failed to re-connect: ${error.message}`,
          });
        });
      }

      ethereum.on('chainChanged', (chainId: SupportedEVMChainIds) => {
        createLog({
          providerType: 'ethereum',
          status: 'info',
          method: 'chainChanged',
          message: `Switched to ${getChainName(chainId)} (Chain ID: ${chainId})`,
        });

        ethereum.request({ method: 'eth_requestAccounts' }).catch((error) => {
          createLog({
            providerType: 'ethereum',
            status: 'error',
            method: 'eth_requestAccounts',
            message: `Failed to re-connect: ${error.message}`,
          });
        });
      });
    });

    return () => {
      solana.disconnect();
    };
  }, [provider, createLog]);

  /** Connect to both Solana and Ethereum Providers */
  const handleConnect = useCallback(async () => {
    if (!provider) return;
    const { solana, ethereum } = provider;

    try {
      await solana.connect();
    } catch (error) {
      createLog({
        providerType: 'solana',
        status: 'error',
        method: 'connect',
        message: error.message,
      });
    }

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
        message: error.message,
      });
    }

    // Immediately switch to Ethereum Goerli for Sandbox purposes
    if (ethereum.chainId != SupportedEVMChainIds.EthereumGoerli) {
      isEthereumChainIdReady(SupportedEVMChainIds.EthereumGoerli);
    }
  }, [provider, createLog]);

  // /** SignAndSendTransaction via Solana Provider (v0 tx) */
  const handleSignAndSendTransactionOnSolana = useCallback(async () => {
    if (!provider) return;
    const { solana } = provider;
    try {
      const transactionV0 = await createTransferTransactionV0(solana.publicKey, connection);
      createLog({
        providerType: 'solana',
        status: 'info',
        method: 'signAndSendTransaction',
        message: `Requesting signature for ${JSON.stringify(transactionV0)}`,
      });
      const signature = await signAndSendTransactionOnSolana(solana, transactionV0);
      createLog({
        providerType: 'solana',
        status: 'info',
        method: 'signAndSendTransaction',
        message: `Signed and submitted transaction ${signature}.`,
      });
      pollSolanaSignatureStatus(signature, connection, createLog);
    } catch (error) {
      createLog({
        providerType: 'solana',
        status: 'error',
        method: 'signAndSendTransaction',
        message: error.message,
      });
    }
  }, [provider, createLog]);

  /** SendTransaction via Ethereum Provider */
  const handleSendTransactionOnEthereum = useCallback(
    async (chainId) => {
      const ready = await isEthereumChainIdReady(chainId);
      if (!ready) return;
      const { ethereum } = provider;
      try {
        // send the transaction up to the network
        const txHash = await sendTransactionOnEthereum(ethereum);
        createLog({
          providerType: 'ethereum',
          status: 'info',
          method: 'eth_sendTransaction',
          message: `Sending transaction ${txHash}`,
        });
        // poll tx status until it is confirmed in a block, fails, or 30 seconds pass
        pollEthereumTransactionReceipt(txHash, ethereum, createLog);
      } catch (error) {
        createLog({
          providerType: 'ethereum',
          status: 'error',
          method: 'eth_sendTransaction',
          message: error.message,
        });
      }
    },
    [provider, createLog]
  );

  /** SignTransaction */
  // const handleSignTransactionOnSolana = useCallback(async () => {
  //   if (!provider) return;
  //   const { solana } = provider;
  //   try {
  //     const transaction = await createTransferTransactionV0(solana.publicKey, connection);
  //     createLog({
  //       providerType: 'solana',
  //       status: 'info',
  //       method: 'signTransaction',
  //       message: `Requesting signature for: ${JSON.stringify(transaction)}`,
  //     });
  //     const signedTransaction = await signTransactionOnSolana(solana, transaction);
  //     createLog({
  //       providerType: 'solana',
  //       status: 'success',
  //       method: 'signTransaction',
  //       message: `Transaction signed: ${JSON.stringify(signedTransaction)}`,
  //     });
  //   } catch (error) {
  //     createLog({
  //       providerType: 'solana',
  //       status: 'error',
  //       method: 'signTransaction',
  //       message: error.message,
  //     });
  //   }
  // }, [provider, createLog]);

  // /** SignAllTransactions */
  // const handleSignAllTransactionsOnSolana = useCallback(async () => {
  //   if (!provider) return;
  //   const { solana } = provider;
  //   try {
  //     const transactions = [
  //       await createTransferTransactionV0(solana.publicKey, connection),
  //       await createTransferTransactionV0(solana.publicKey, connection),
  //     ];
  //     createLog({
  //       providerType: 'solana',
  //       status: 'info',
  //       method: 'signAllTransactions',
  //       message: `Requesting signature for: ${JSON.stringify(transactions)}`,
  //     });
  //     const signedTransactions = await signAllTransactionsOnSolana(solana, transactions[0], transactions[1]);
  //     createLog({
  //       providerType: 'solana',
  //       status: 'success',
  //       method: 'signAllTransactions',
  //       message: `Transactions signed: ${JSON.stringify(signedTransactions)}`,
  //     });
  //   } catch (error) {
  //     createLog({
  //       providerType: 'solana',
  //       status: 'error',
  //       method: 'signAllTransactions',
  //       message: error.message,
  //     });
  //   }
  // }, [provider, createLog]);

  // /** SignMessage via Solana Provider */
  const handleSignMessageOnSolana = useCallback(async () => {
    if (!provider) return;
    const { solana } = provider;
    try {
      const signedMessage = await signMessageOnSolana(solana, message);
      createLog({
        providerType: 'solana',
        status: 'success',
        method: 'signMessage',
        message: `Message signed: ${JSON.stringify(signedMessage)}`,
      });
      return signedMessage;
    } catch (error) {
      createLog({
        providerType: 'solana',
        status: 'error',
        method: 'signMessage',
        message: error.message,
      });
    }
  }, [provider, createLog]);

  /** SignMessage via Ethereum Provider */
  const handleSignMessageOnEthereum = useCallback(
    async (chainId) => {
      const ready = await isEthereumChainIdReady(chainId);
      if (!ready) return;
      const { ethereum } = provider;
      try {
        const signedMessage = await signMessageOnEthereum(ethereum, message);
        createLog({
          providerType: 'ethereum',
          status: 'success',
          method: 'personal_sign',
          message: `Message signed: ${signedMessage}`,
        });
        return signedMessage;
      } catch (error) {
        createLog({
          providerType: 'ethereum',
          status: 'error',
          method: 'personal_sign',
          message: error.message,
        });
      }
    },
    [provider, createLog]
  );

  /** Re-connect to Ethereum Chain */
  const handleReconnect = useCallback(
    async (chainId: SupportedEVMChainIds) => {
      const ready = await isEthereumChainIdReady(chainId);
      if (!ready) return;
      const { ethereum } = provider;
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
          message: error.message,
        });
      }
    },
    [provider, createLog]
  );

  /** Disconnect from Solana */
  const handleDisconnect = useCallback(async () => {
    console.log('disconnect');
    if (!provider) return;
    const { solana } = provider;
    try {
      await solana.disconnect();
    } catch (error) {
      createLog({
        providerType: 'solana',
        status: 'error',
        method: 'disconnect',
        message: error.message,
      });
    }
  }, [provider, createLog]);

  /** Switch Ethereum Chains */
  const isEthereumChainIdReady = useCallback(
    async (chainId: SupportedEVMChainIds) => {
      if (!provider) return false;
      const { ethereum } = provider;
      if (chainId === ethereum.chainId) return true;
      try {
        await switchEthereumChain(ethereum, chainId);
        createLog({
          providerType: 'ethereum',
          status: 'success',
          method: 'wallet_switchEthereumChain',
          message: `Switched to ${getChainName(ethereum.chainId)} (Chain ID: ${ethereum.chainId})`,
        });
        return true;
      } catch (error) {
        createLog({
          providerType: 'ethereum',
          status: 'error',
          method: 'wallet_switchEthereumChain',
          message: error.message,
        });
        return false;
      }
    },
    [provider, createLog]
  );

  const connectedMethods = useMemo(() => {
    return [
      {
        chain: 'solana',
        name: 'Sign and Send Transaction',
        onClick: handleSignAndSendTransactionOnSolana,
      },
      {
        chain: 'ethereum',
        name: 'Send Transaction',
        onClick: handleSendTransactionOnEthereum,
      },
      {
        chain: 'solana',
        name: 'Sign Message',
        onClick: handleSignMessageOnSolana,
      },
      {
        chain: 'ethereum',
        name: 'Sign Message',
        onClick: handleSignMessageOnEthereum,
      },
      {
        chain: 'ethereum',
        name: 'Reconnect',
        onClick: handleReconnect,
      },
      {
        chain: 'solana',
        name: 'Disconnect',
        onClick: handleDisconnect,
      },
    ];
  }, [
    handleSignAndSendTransactionOnSolana,
    handleSendTransactionOnEthereum,
    handleSignMessageOnSolana,
    handleSignMessageOnEthereum,
    handleReconnect,
    handleDisconnect,
  ]);

  return {
    connectedAccounts: {
      solana: provider?.solana?.publicKey,
      ethereum: provider?.ethereum?.selectedAddress,
    },
    connectedEthereumChainId: provider?.ethereum?.chainId,
    connectedMethods,
    handleConnect,
    logs,
    clearLogs,
  };
};

// =============================================================================
// Stateless Component
// =============================================================================

const StatelessApp = React.memo((props: Props) => {
  const { connectedAccounts, connectedEthereumChainId, connectedMethods, handleConnect, logs, clearLogs } = props;

  return (
    <StyledApp>
      <Sidebar
        connectedAccounts={connectedAccounts}
        connectedEthereumChainId={connectedEthereumChainId}
        connectedMethods={connectedMethods}
        connect={handleConnect}
      />
      <Logs connectedAccounts={connectedAccounts} logs={logs} clearLogs={clearLogs} />
    </StyledApp>
  );
});

// =============================================================================
// Main Component
// =============================================================================

const App = () => {
  const [provider, setProvider] = useState<PhantomInjectedProvider | null>(null);
  const props = useProps(provider);

  useEffect(() => {
    const getPhantomMultiChainProvider = async () => {
      const phantomMultiChainProvider = await detectPhantomMultiChainProvider();
      setProvider(phantomMultiChainProvider);
    };
    getPhantomMultiChainProvider();
  }, []);

  if (!provider) {
    return <NoProvider />;
  }

  return <StatelessApp {...props} />;
};

export default App;
