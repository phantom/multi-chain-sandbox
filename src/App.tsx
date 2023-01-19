/**
 * @DEV: If the sandbox is throwing dependency errors, chances are you need to clear your browser history.
 * This will trigger a re-install of the dependencies in the sandbox – which should fix things right up.
 * Alternatively, you can fork this sandbox to refresh the dependencies manually.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Connection, PublicKey } from '@solana/web3.js';

import {
  createTransferTransactionV0,
  detectPhantomMultiChainProvider,
  getChainName,
  pollEthereumTransactionReceipt,
  pollSolanaSignatureStatus,
  sendTransactionOnEthereum,
  signAndSendTransactionOnSolana,
  signMessageOnEthereum,
  signMessageOnSolana,
} from './utils';

import { PhantomInjectedProvider, SupportedEVMChainIds, TLog } from './types';

import { Logs, NoProvider, Sidebar } from './components';
import { connect, silentlyConnect } from './utils/connect';
import { setupEvents } from './utils/setupEvents';
import { ensureEthereumChain } from './utils/ensureEthereumChain';
import { useEthereumSelectedAddress } from './utils/getEthereumSelectedAddress';

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

// NB: This URL will only work for Phantom sandbox apps! Please do not use this for your project. If you are running this locally we recommend using one of Solana's public RPC endpoints
const solanaNetwork = 'https://phantom-phantom-f0ad.mainnet.rpcpool.com/';
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
  /** Logs to display in the Sandbox console */
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

  const [ethereumSelectedAddress, setEthereumSelectedAddress] = useEthereumSelectedAddress(provider?.ethereum);

  /** Side effects to run once providers are detected */
  useEffect(() => {
    if (!provider) return;
    const { solana, ethereum } = provider;

    // attempt to eagerly connect on initial startup
    silentlyConnect({ solana, ethereum }, createLog);
    setupEvents({ solana, ethereum }, createLog, setEthereumSelectedAddress);

    return () => {
      solana.disconnect();
    };
  }, [provider, createLog, setEthereumSelectedAddress]);

  /** Connect to both Solana and Ethereum Providers */
  const handleConnect = useCallback(async () => {
    if (!provider) return;
    const { solana, ethereum } = provider;

    await connect({ solana, ethereum }, createLog);

    // Immediately switch to Ethereum Goerli for Sandbox purposes
    await ensureEthereumChain(ethereum, SupportedEVMChainIds.EthereumGoerli, createLog);
  }, [provider, createLog]);

  /** SignAndSendTransaction via Solana Provider */
  const handleSignAndSendTransactionOnSolana = useCallback(async () => {
    if (!provider) return;
    const { solana } = provider;
    try {
      // create a v0 transaction
      const transactionV0 = await createTransferTransactionV0(solana.publicKey, connection);
      createLog({
        providerType: 'solana',
        status: 'info',
        method: 'signAndSendTransaction',
        message: `Requesting signature for ${JSON.stringify(transactionV0)}`,
      });
      // sign and submit the transaction via Phantom
      const signature = await signAndSendTransactionOnSolana(solana, transactionV0);
      createLog({
        providerType: 'solana',
        status: 'info',
        method: 'signAndSendTransaction',
        message: `Signed and submitted transaction ${signature}.`,
      });
      // poll tx status until it is confirmed or 30 seconds pass
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

  /**
   * Switch Ethereum Chains
   * When a user connects to a dApp, Phantom considers them connected on all chains
   * When the Ethereum provider's chainId is changed, Phantom will not prompt the user for approval
   * */
  const isEthereumChainIdReady = useCallback(
    async (chainId: SupportedEVMChainIds) => {
      if (!provider) return false;
      const { ethereum } = provider;
      return await ensureEthereumChain(ethereum, chainId, createLog);
    },
    [provider, createLog]
  );

  /** SendTransaction via Ethereum Provider */
  const handleSendTransactionOnEthereum = useCallback(
    async (chainId) => {
      // set ethereum provider to the correct chainId
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
          message: `Sending transaction ${txHash} on ${chainId ? getChainName(chainId) : 'undefined'}`,
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
    [provider, createLog, isEthereumChainIdReady]
  );

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
      // set ethereum provider to the correct chainId
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
    [provider, createLog, isEthereumChainIdReady]
  );

  /**
   * Disconnect from Solana
   * At this time, there is no way to programmatically disconnect from Ethereum
   * MULTI-CHAIN PROVIDER TIP: You can only disconnect on the solana provider. But after when disconnecting your should use the
   * multi-chain connect method to reconnect.
   */
  const handleDisconnect = useCallback(async () => {
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
    handleDisconnect,
  ]);

  return {
    connectedAccounts: {
      solana: provider?.solana?.publicKey,
      ethereum: ethereumSelectedAddress,
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
