/**
 * @DEV: If the sandbox is throwing dependency errors, chances are you need to clear your browser history.
 * This will trigger a re-install of the dependencies in the sandbox – which should fix things right up.
 * Alternatively, you can fork this sandbox to refresh the dependencies manually.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';

import {
  //   createAddressLookupTable,
  //   createTransferTransaction,
  createTransferTransactionV0,
  //   extendAddressLookupTable,
  //   getSolanaProvider,
  //   getEthereumProvider,
  pollSolanaSignatureStatus,
  //   sendEVMTransaction,
  //   signAllTransactions,
  signAndSendTransaction,
  signMessageOnSolana,
  //   signAndSendTransactionV0WithLookupTable,
  //   signMessage,
  //   signTransaction,
} from './utils';

import { PhantomEthereumProvider, PhantomMultiChainProvider, PhantomMultiChainProviderWithWeb3, TLog } from './types';

import { Logs, Sidebar, NoProvider } from './components';
import detectPhantomMultiChainProvider from './utils/detectPhantomMultiChainProvider';
import getPhantomMultiChainProvider from './utils/getPhantomMultiChainProvider';
import signMessageOnEthereum from './utils/signMessageOnEthereum';

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
// let accounts = [];
// const provider = getPhantomMultiChainProvider();
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
      name: string;
      onClick: () => Promise<string>;
    }
  | {
      name: string;
      onClick: () => Promise<void>;
    };

interface Props {
  connectedAccounts: ConnectedAccounts;
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
const useProps = (provider: PhantomMultiChainProviderWithWeb3 | null): Props => {
  // const useProps = (): Props => {
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

  useEffect(() => {
    if (!provider) return;
    const { solana, ethereum, web3 } = provider;

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

    ethereum.on('connect', (connectionInfo: { chainId: string }) => {
      createLog({
        providerType: 'ethereum',
        status: 'success',
        method: 'connect',
        message: `Connected to chain ${connectionInfo.chainId}`,
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
          method: 'accountChanged',
          message: `Switched to account ${newAccounts[0]}`,
        });
        // accounts = newAccounts
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
          method: 'accountChanged',
          message: 'Attempting to switch accounts.',
        });

        web3.send('eth_requestAccounts', []).catch((error) => {
          createLog({
            providerType: 'ethereum',
            status: 'error',
            method: 'accountChanged',
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
    });

    return () => {
      solana.disconnect();
    };
  }, [provider, createLog]);

  /** Connect */
  const handleConnect = useCallback(async () => {
    if (!provider) return;
    const { solana, ethereum, web3 } = provider;

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
      const accounts = await web3.send('eth_requestAccounts', []);
      createLog({
        providerType: 'ethereum',
        status: 'success',
        method: 'connect',
        message: `Connected to account ${accounts[0]}`,
      });
    } catch (error) {
      createLog({
        providerType: 'ethereum',
        status: 'error',
        method: 'connect',
        message: error.message,
      });
    }

    // const signer = web3.getSigner();
    // console.log('signer', signer);
    // const signedMessage = await signer.signMessage(message);
    // console.log(signedMessage);

    if (!ethereum.selectedAddress) {
      console.log('Not connected on ethereum');
    }

    // if (!solanaProvider) return;

    // try {
    //   await solanaProvider.connect();
    // } catch (error) {
    //   createLog({
    //     status: 'error',
    //     method: 'connect',
    //     message: error.message,
    //   });
    // }

    // try {
    //   const accounts = await ethereumProvider.send('eth_requestAccounts', []);
    //   createLog({
    //     status: 'success',
    //     method: 'connect',
    //     message: `connected to EVM account ${accounts[0]}`,
    //   });
    // } catch (error) {
    //   createLog({
    //     status: 'error',
    //     method: 'connect',
    //     message: error.message,
    //   });
    // }
  }, [provider, createLog]);

  // /** SignAndSendTransactionV0 */
  const handleSignAndSendTransactionOnSolana = useCallback(async () => {
    if (!provider) return;
    const { solana } = provider;
    try {
      const transactionV0 = await createTransferTransactionV0(solana.publicKey, connection);
      createLog({
        providerType: 'solana',
        status: 'info',
        method: 'signAndSendTransactionV0',
        message: `Requesting signature for: ${JSON.stringify(transactionV0)}`,
      });
      const signature = await signAndSendTransaction(solana, transactionV0);
      createLog({
        providerType: 'solana',
        status: 'info',
        method: 'signAndSendTransactionV0',
        message: `Signed and submitted transactionV0 ${signature}.`,
      });
      pollSolanaSignatureStatus(signature, connection, createLog);
    } catch (error) {
      createLog({
        providerType: 'solana',
        status: 'error',
        method: 'signAndSendTransactionV0',
        message: error.message,
      });
    }
  }, [provider, createLog]);

  // /** SignTransaction */
  // const handleSolanaSignTransaction = useCallback(async () => {
  //   if (!provider) return;
  //   const { solana } = provider;
  //   try {
  //     const transaction = await createTransferTransaction(solanaProvider.publicKey, connection);
  //     createLog({
  //       status: 'info',
  //       method: 'signTransaction',
  //       message: `Requesting signature for: ${JSON.stringify(transaction)}`,
  //     });
  //     const signedTransaction = await signTransaction(solanaProvider, transaction);
  //     createLog({
  //       status: 'success',
  //       method: 'signTransaction',
  //       message: `Transaction signed: ${JSON.stringify(signedTransaction)}`,
  //     });
  //   } catch (error) {
  //     createLog({
  //       status: 'error',
  //       method: 'signTransaction',
  //       message: error.message,
  //     });
  //   }
  // }, [createLog]);

  // /** SignAllTransactions */
  // const handleSignAllTransactions = useCallback(async () => {
  //   if (!solanaProvider) return;

  //   try {
  //     const transactions = [
  //       await createTransferTransaction(solanaProvider.publicKey, connection),
  //       await createTransferTransaction(solanaProvider.publicKey, connection),
  //     ];
  //     createLog({
  //       status: 'info',
  //       method: 'signAllTransactions',
  //       message: `Requesting signature for: ${JSON.stringify(transactions)}`,
  //     });
  //     const signedTransactions = await signAllTransactions(solanaProvider, transactions[0], transactions[1]);
  //     createLog({
  //       status: 'success',
  //       method: 'signAllTransactions',
  //       message: `Transactions signed: ${JSON.stringify(signedTransactions)}`,
  //     });
  //   } catch (error) {
  //     createLog({
  //       status: 'error',
  //       method: 'signAllTransactions',
  //       message: error.message,
  //     });
  //   }
  // }, [createLog]);

  // /** SignMessage */
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

  // /** SignMessage */
  const handleSignMessageOnEthereum = useCallback(async () => {
    if (!provider) return;
    const { web3 } = provider;
    try {
      const signedMessage = await signMessageOnEthereum(web3, message);
      createLog({
        providerType: 'ethereum',
        status: 'success',
        method: 'signMessage',
        message: `Message signed: ${JSON.stringify(signedMessage)}`,
      });
      return signedMessage;
    } catch (error) {
      createLog({
        providerType: 'ethereum',
        status: 'error',
        method: 'signMessage',
        message: error.message,
      });
    }
  }, [provider, createLog]);

  /** Disconnect */
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

  // const handleEthSendTransaction = useCallback(async () => {
  //   if (!ethereumProvider) return;

  //   try {
  //     // send the transaction up to the network
  //     const transaction = await sendEVMTransaction(ethereumProvider);
  //     createLog({
  //       status: 'info',
  //       method: 'eth_sendTransaction',
  //       message: `Sending transaction: ${JSON.stringify(transaction)}`,
  //     });
  //     try {
  //       // wait for the transaction to be included in the next block
  //       const txReceipt = await transaction.wait(1); // 1 is number of blocks to be confirmed before returning the receipt
  //       createLog({
  //         status: 'success',
  //         method: 'eth_sendTransaction',
  //         message: `TX included: ${JSON.stringify(txReceipt)}`,
  //       });
  //     } catch (error) {
  //       // log out if the tx didn't get included for some reason
  //       createLog({
  //         status: 'error',
  //         method: 'eth_sendTransaction',
  //         message: `Failed to include transaction on the chain: ${error.message}`,
  //       });
  //     }
  //   } catch (error) {
  //     createLog({
  //       status: 'error',
  //       method: 'eth_sendTransaction',
  //       message: error.message,
  //     });
  //   }
  // }, [ethereumProvider, createLog]);

  const connectedMethods = useMemo(() => {
    return [
      {
        name: '[Solana] Sign and Send Transaction',
        onClick: handleSignAndSendTransactionOnSolana,
      },
      // {
      //   name: '[EVM] Sign and Send Transaction',
      //   onClick: handleEthSendTransaction,
      // },
      // {
      //   name: 'Sign Transaction',
      //   onClick: handleSignTransaction,
      // },
      // {
      //   name: 'Sign All Transactions',
      //   onClick: handleSignAllTransactions,
      // },
      {
        name: '[Solana] Sign Message',
        onClick: handleSignMessageOnSolana,
      },
      {
        name: '[EVM] Sign Message',
        onClick: handleSignMessageOnEthereum,
      },
      {
        name: 'Disconnect',
        onClick: handleDisconnect,
      },
    ];
  }, [
    // handleSignAndSendTransaction,
    // handleSignAndSendTransactionV0,
    // handleSignAndSendTransactionV0WithLookupTable,
    // handleSignTransaction,
    // handleSignAllTransactions,
    // handleSignMessage,
    handleDisconnect,
  ]);

  return {
    connectedAccounts: {
      solana: provider?.solana?.publicKey,
      // @ts-ignore:next-line
      ethereum: provider?.web3?.provider?.selectedAddress,
      // ethereum: provider?.ethereum?.selectedAddress,
    },
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
  const { connectedAccounts, connectedMethods, handleConnect, logs, clearLogs } = props;

  return (
    <StyledApp>
      <Sidebar connectedAccounts={connectedAccounts} connectedMethods={connectedMethods} connect={handleConnect} />
      <Logs connectedAccounts={connectedAccounts} logs={logs} clearLogs={clearLogs} />
    </StyledApp>
  );
});

// =============================================================================
// Main Component
// =============================================================================

const App = () => {
  // const props = useProps();
  const [provider, setProvider] = useState<PhantomMultiChainProviderWithWeb3 | null>(null);
  const props = useProps(provider);

  useEffect(() => {
    const getPhantomMultiChainProvider = async () => {
      const phantomMultiChainProvider = await detectPhantomMultiChainProvider();
      console.log(phantomMultiChainProvider);
      if (phantomMultiChainProvider?.ethereum && phantomMultiChainProvider?.solana) {
        setProvider(phantomMultiChainProvider);
      }
    };
    getPhantomMultiChainProvider();
  }, []);

  if (!provider) {
    return <NoProvider />;
  }

  // if (!provider) {
  //   return <NoProvider />;
  // }

  return <StatelessApp {...props} />;
};

export default App;
