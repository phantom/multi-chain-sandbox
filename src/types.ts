import { PublicKey, Transaction, VersionedTransaction, SendOptions } from '@solana/web3.js';
import { providers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

type DisplayEncoding = 'utf8' | 'hex';

type SolanaEvent = 'connect' | 'disconnect' | 'accountChanged';

type EthereumEvent = 'connect' | 'disconnect' | 'accountsChanged' | 'chainChanged';

type SolanaRequestMethod =
  | 'connect'
  | 'disconnect'
  | 'signAndSendTransaction'
  | 'signTransaction'
  | 'signAllTransactions'
  | 'signMessage';

/** This is a subset of Phantom's supported JSON RPC methods */
type EthereumRequestMethod =
  | 'eth_gasPrice'
  | 'eth_getTransactionCount'
  | 'eth_getTransactionReceipt'
  | 'eth_sendTransaction'
  | 'eth_requestAccounts'
  | 'personal_sign'
  | 'wallet_switchEthereumChain';

type PhantomRequestMethod = SolanaRequestMethod | EthereumRequestMethod;
interface SolanaConnectOptions {
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
  connect: (opts?: Partial<SolanaConnectOptions>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: SolanaEvent, handler: (args: any) => void) => void;
  request: (method: SolanaRequestMethod, params: any) => Promise<unknown>;
}

// TODO _events and _eventsCount
export interface PhantomEthereumProvider {
  chainId: SupportedEVMChainIds;
  isMetaMask?: boolean; // will be removed after beta
  isPhantom: boolean;
  networkVersion: string;
  selectedAddress: string;
  isConnected: () => boolean;
  on: (event: EthereumEvent, handler: (args: any) => void) => void;
  request: (args: { method: EthereumRequestMethod; params?: unknown[] | object }) => Promise<unknown>;
  _metamask: {
    isUnlocked: boolean;
  };
}

export interface PhantomInjectedProvider {
  ethereum: PhantomEthereumProvider;
  solana: PhantomSolanaProvider;
}

export type PhantomProviderType = 'solana' | 'ethereum';

export type PhantomEvent = EthereumEvent | SolanaEvent;

export type Status = 'success' | 'warning' | 'error' | 'info';
export interface TLog {
  providerType: PhantomProviderType;
  status: Status;
  method?: PhantomRequestMethod | Extract<PhantomEvent, 'accountChanged' | 'accountsChanged' | 'chainChanged'>;
  message: string;
  messageTwo?: string;
}

export enum SupportedEVMChainIds {
  EthereumMainnet = '0x1',
  EthereumGoerli = '0x5',
  PolygonMainnet = '0x137',
  PolygonMumbai = '0x80001',
}

export enum SupportedSolanaChainIds {
  SolanaMainnet = 'solana:101',
  SolanaTestnet = 'solana:102',
  SolanaDevnet = 'solana:103',
}

export enum SupportedChainNames {
  EthereumMainnet = 'Ethereum Mainnet',
  EthereumGoerli = 'Ethereum Goerli',
  PolygonMainnet = 'Polygon Mainnet',
  PolygonMumbai = 'Polygon Mumbai',
  SolanaMainnet = 'Solana Mainnet Beta',
  SolanaTestnet = 'Solana Testnet',
  SolanaDevnet = 'Solana Devnet',
}

export enum SupportedChainTypes {
  EthereumMainnet = 'ethereum',
  EthereumGoerli = 'ethereum',
  PolygonMainnet = 'polygon',
  PolygonMumbai = 'polygon',
  SolanaMainnet = 'solana',
  SolanaTestnet = 'solana',
  SolanaDevnet = 'solana',
}

export enum SupportedChainIcons {
  Ethereum = '/images/ethereum.png',
  Polygon = '/images/polygon.png',
  Solana = '/images/solana.png',
}
