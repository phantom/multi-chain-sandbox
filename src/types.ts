import { PublicKey, Transaction, VersionedTransaction, SendOptions } from '@solana/web3.js';
import { providers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

type DisplayEncoding = 'utf8' | 'hex';

type PhantomProviderType = 'solana' | 'ethereum';

type PhantomEvent = 'connect' | 'disconnect' | 'accountChanged';

type PhantomRequestMethod =
  | 'connect'
  | 'disconnect'
  | 'signAndSendTransaction'
  | 'signAndSendTransactionV0'
  | 'signAndSendTransactionV0WithLookupTable'
  | 'signTransaction'
  | 'signAllTransactions'
  | 'signMessage'
  | 'eth_sendTransaction';

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

export interface PhantomSolanaProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signAndSendTransaction: (
    transaction: Transaction | VersionedTransaction,
    opts?: SendOptions
  ) => Promise<{ signature: string; publicKey: PublicKey }>;
  signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>;
  signAllTransactions: (
    transactions: (Transaction | VersionedTransaction)[]
  ) => Promise<(Transaction | VersionedTransaction)[]>;
  signMessage: (message: Uint8Array | string, display?: DisplayEncoding) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

export type PhantomEthereumProvider = any;
// export interface PhantomEthereumProvider {
//   chainId: string;
//   isMetaMask?: boolean;
//   isPhantom: boolean;
//   networkVersion: string;
//   selectedAddress: string;
//   _events: Object;
//   _eventsCount: Object;
//   _metamask: Object;
// }

export interface PhantomMultiChainProvider {
  ethereum: PhantomEthereumProvider;
  solana: PhantomSolanaProvider;
}

export interface PhantomMultiChainProviderWithWeb3 extends PhantomMultiChainProvider {
  web3: Web3Provider;
}

export type Status = 'success' | 'warning' | 'error' | 'info';

export interface TLog {
  providerType: PhantomProviderType;
  status: Status;
  method?: PhantomRequestMethod | Extract<PhantomEvent, 'accountChanged'>;
  message: string;
  messageTwo?: string;
}
