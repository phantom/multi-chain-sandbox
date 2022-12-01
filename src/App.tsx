/**
 * @DEV: If the sandbox is throwing dependency errors, chances are you need to clear your browser history.
 * This will trigger a re-install of the dependencies in the sandbox – which should fix things right up.
 * Alternatively, you can fork this sandbox to refresh the dependencies manually.
 */
import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import styled from 'styled-components';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';

import {
  createAddressLookupTable,
  createTransferTransaction,
  createTransferTransactionV0,
  extendAddressLookupTable,
  getSolanaProvider,
  getEthereumProvider,
  pollSignatureStatus,
  sendEVMTransaction,
  signAllTransactions,
  signAndSendTransaction,
  signAndSendTransactionV0WithLookupTable,
  signMessage,
  signTransaction,
} from './utils';

import { PhantomEthereumProvider, TLog } from './types';

import { Logs, Sidebar, NoProvider } from './components';
import detectPhantomMultiChainProvider from './utils/detectPhantomMultiChainProvider';
import getPhantomMultiChainProvider from './utils/getPhantomMultiChainProvider';

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
// const solanaProvider = getSolanaProvider();
// const ethereumProvider = getEthereumProvider();
const solanaProvider = {};
const ethereumProvider = {};
const provider = getPhantomMultiChainProvider();
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
  publicKey: PublicKey | null;
  connectedMethods: ConnectedMethods[];
  handleConnect: () => Promise<void>;
  ethereumProvider: PhantomEthereumProvider;
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
const useProps = (): Props => {
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

  // useEffect(() => {
  //   if (!provider) return;
  //   console.log(provider);
  //   const { solana, ethereum } = provider;

  //   // attempt to eagerly connect
  //   solana.connect({ onlyIfTrusted: true }).catch(() => {
  //     // fail silently
  //   });
  // }, []);

  // useEffect(() => {
  //   if (!solanaProvider || !ethereumProvider) return;

  //   // attempt to eagerly connect
  //   solanaProvider.connect({ onlyIfTrusted: true }).catch(() => {
  //     // fail silently
  //   });

  //   solanaProvider.on('connect', (publicKey: PublicKey) => {
  //     createLog({
  //       status: 'success',
  //       method: 'connect',
  //       message: `Connected to Solana account ${publicKey.toBase58()}`,
  //     });
  //   });

  //   ethereumProvider.on('connect', (connectionInfo: { chainId: string }) => {
  //     createLog({
  //       status: 'success',
  //       method: 'connect',
  //       message: `Connected to EVM chain ${connectionInfo.chainId}`,
  //     });
  //   });

  //   solanaProvider.on('disconnect', () => {
  //     createLog({
  //       status: 'warning',
  //       method: 'disconnect',
  //       message: '👋',
  //     });
  //   });

  //   solanaProvider.on('accountChanged', (publicKey: PublicKey | null) => {
  //     if (publicKey) {
  //       createLog({
  //         status: 'info',
  //         method: 'accountChanged',
  //         message: `Switched to account ${publicKey.toBase58()}`,
  //       });
  //     } else {
  //       /**
  //        * In this case dApps could...
  //        *
  //        * 1. Not do anything
  //        * 2. Only re-connect to the new account if it is trusted
  //        *
  //        * ```
  //        * solanaProvider.connect({ onlyIfTrusted: true }).catch((err) => {
  //        *  // fail silently
  //        * });
  //        * ```
  //        *
  //        * 3. Always attempt to reconnect
  //        */

  //       createLog({
  //         status: 'info',
  //         method: 'accountChanged',
  //         message: 'Attempting to switch accounts.',
  //       });

  //       solanaProvider.connect().catch((error) => {
  //         createLog({
  //           status: 'error',
  //           method: 'accountChanged',
  //           message: `Failed to re-connect: ${error.message}`,
  //         });
  //       });
  //     }
  //   });

  //   return () => {
  //     solanaProvider.disconnect();
  //     ethereumProvider.disconnect();
  //   };
  // }, [createLog]);

  // /** SignAndSendTransaction */
  // const handleSignAndSendTransaction = useCallback(async () => {
  //   if (!solanaProvider) return;

  //   try {
  //     const transaction = await createTransferTransaction(solanaProvider.publicKey, connection);
  //     createLog({
  //       status: 'info',
  //       method: 'signAndSendTransaction',
  //       message: `Requesting signature for: ${JSON.stringify(transaction)}`,
  //     });
  //     const signature = await signAndSendTransaction(solanaProvider, transaction);
  //     createLog({
  //       status: 'info',
  //       method: 'signAndSendTransaction',
  //       message: `Signed and submitted transaction ${signature}.`,
  //     });
  //     pollSignatureStatus(signature, connection, createLog);
  //   } catch (error) {
  //     createLog({
  //       status: 'error',
  //       method: 'signAndSendTransaction',
  //       message: error.message,
  //     });
  //   }
  // }, [createLog]);

  // /** SignAndSendTransactionV0 */
  // const handleSignAndSendTransactionV0 = useCallback(async () => {
  //   if (!solanaProvider) return;

  //   try {
  //     const transactionV0 = await createTransferTransactionV0(solanaProvider.publicKey, connection);
  //     createLog({
  //       status: 'info',
  //       method: 'signAndSendTransactionV0',
  //       message: `Requesting signature for: ${JSON.stringify(transactionV0)}`,
  //     });
  //     const signature = await signAndSendTransaction(solanaProvider, transactionV0);
  //     createLog({
  //       status: 'info',
  //       method: 'signAndSendTransactionV0',
  //       message: `Signed and submitted transactionV0 ${signature}.`,
  //     });
  //     pollSignatureStatus(signature, connection, createLog);
  //   } catch (error) {
  //     createLog({
  //       status: 'error',
  //       method: 'signAndSendTransactionV0',
  //       message: error.message,
  //     });
  //   }
  // }, [createLog]);

  // /** SignAndSendTransactionV0WithLookupTable */
  // const handleSignAndSendTransactionV0WithLookupTable = useCallback(async () => {
  //   if (!solanaProvider) return;
  //   let blockhash = await connection.getLatestBlockhash().then((res) => res.blockhash);
  //   try {
  //     const [lookupSignature, lookupTableAddress] = await createAddressLookupTable(
  //       solanaProvider,
  //       solanaProvider.publicKey,
  //       connection,
  //       blockhash
  //     );
  //     createLog({
  //       status: 'info',
  //       method: 'signAndSendTransactionV0WithLookupTable',
  //       message: `Signed and submitted transactionV0 to make an Address Lookup Table ${lookupTableAddress} with signature: ${lookupSignature}. Please wait for 5-7 seconds after signing the next transaction to be able to see the next transaction popup. This time is needed as newly appended addresses require one slot to warmup before being available to transactions for lookups.`,
  //     });
  //     const extensionSignature = await extendAddressLookupTable(
  //       solanaProvider,
  //       solanaProvider.publicKey,
  //       connection,
  //       blockhash,
  //       lookupTableAddress
  //     );
  //     createLog({
  //       status: 'info',
  //       method: 'signAndSendTransactionV0WithLookupTable',
  //       message: `Signed and submitted transactionV0 to extend Address Lookup Table ${extensionSignature}.`,
  //     });

  //     const signature = await signAndSendTransactionV0WithLookupTable(
  //       solanaProvider,
  //       solanaProvider.publicKey,
  //       connection,
  //       blockhash,
  //       lookupTableAddress
  //     );
  //     createLog({
  //       status: 'info',
  //       method: 'signAndSendTransactionV0WithLookupTable',
  //       message: `Signed and submitted transactionV0 with Address Lookup Table ${signature}.`,
  //     });
  //     pollSignatureStatus(signature, connection, createLog);
  //   } catch (error) {
  //     createLog({
  //       status: 'error',
  //       method: 'signAndSendTransactionV0WithLookupTable',
  //       message: error.message,
  //     });
  //   }
  // }, [createLog]);

  // /** SignTransaction */
  // const handleSignTransaction = useCallback(async () => {
  //   if (!solanaProvider) return;

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
  // const handleSignMessage = useCallback(async () => {
  //   if (!solanaProvider) return;

  //   try {
  //     const signedMessage = await signMessage(solanaProvider, message);
  //     createLog({
  //       status: 'success',
  //       method: 'signMessage',
  //       message: `Message signed: ${JSON.stringify(signedMessage)}`,
  //     });
  //     return signedMessage;
  //   } catch (error) {
  //     createLog({
  //       status: 'error',
  //       method: 'signMessage',
  //       message: error.message,
  //     });
  //   }
  // }, [createLog]);

  /** Connect */
  const handleConnect = useCallback(async () => {
    console.log('connect');
    if (!provider) return;
    const { solana, ethereum } = provider;

    try {
      console.log('trying connect');
      await solana.connect();
    } catch (error) {
      createLog({
        status: 'error',
        method: 'connect',
        message: error.message,
      });
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
  }, [createLog]);

  /** Disconnect */
  const handleDisconnect = useCallback(async () => {
    console.log('disconnect');
    // if (!solanaProvider) return;

    // try {
    //   await solanaProvider.disconnect();
    // } catch (error) {
    //   createLog({
    //     status: 'error',
    //     method: 'disconnect',
    //     message: error.message,
    //   });
    // }
  }, [createLog]);

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
      // {
      //   name: '[Solana] Sign and Send Transaction',
      //   onClick: handleSignAndSendTransaction,
      // },
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
      // {
      //   name: 'Sign Message',
      //   onClick: handleSignMessage,
      // },
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
      ethereum: provider?.ethereum?.connectedAddress,
    },
    publicKey: null,
    connectedMethods,
    handleConnect,
    logs,
    ethereumProvider,
    clearLogs,
  };
};

// =============================================================================
// Stateless Component
// =============================================================================

const StatelessApp = React.memo((props: Props) => {
  const { connectedAccounts, publicKey, connectedMethods, handleConnect, logs, clearLogs } = props;

  return (
    <StyledApp>
      <Sidebar
        connectedAccounts={connectedAccounts}
        publicKey={publicKey}
        connectedMethods={connectedMethods}
        connect={handleConnect}
      />
      <Logs connectedAccounts={connectedAccounts} publicKey={publicKey} logs={logs} clearLogs={clearLogs} />
    </StyledApp>
  );
});

// =============================================================================
// Main Component
// =============================================================================

const App = () => {
  // const [phantomMultiChainProvider, setPhantomMultiChainProvider] = useState(null);
  const props = useProps();

  // useEffect(() => {
  //   const getPhantomMultiChainProvider = async () => {
  //     const provider = await detectPhantomMultiChainProvider();
  //     setPhantomMultiChainProvider(provider);
  //   };
  //   getPhantomMultiChainProvider();
  // }, []);

  // if (!phantomMultiChainProvider) {
  //   return <NoProvider />;
  // }

  if (!provider) {
    return <NoProvider />;
  }

  return <StatelessApp {...props} />;
};

export default App;
