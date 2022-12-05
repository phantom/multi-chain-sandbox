import { PublicKey, Transaction, VersionedTransaction, SendOptions } from '@solana/web3.js';
import { providers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

type DisplayEncoding = 'utf8' | 'hex';

type PhantomProviderType = 'solana' | 'ethereum';

type SolanaEvent = 'connect' | 'disconnect' | 'accountChanged';

type EthereumEvent = 'connect' | 'disconnect' | 'accountsChanged' | 'chainChanged';

type PhantomEvent = EthereumEvent | SolanaEvent;

type SolanaRequestMethod =
  | 'connect'
  | 'disconnect'
  | 'signAndSendTransaction'
  | 'signTransaction'
  | 'signAllTransactions'
  | 'signMessage';

type EthereumRequestMethod =
  | 'eth_gasPrice'
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

// export type PhantomEthereumProvider = any;

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

// TODO
// export interface EthereumProvider {
export interface PhantomEthereumProvider {
  chainId: SupportedEVMChainIds;
  isMetaMask?: boolean; // will be removed after beta
  isPhantom: boolean;
  networkVersion: string;
  selectedAddress: string;
  isConnected: () => boolean;
  on: (event: EthereumEvent, handler: (args: any) => void) => void;
  request: (args: { method: EthereumRequestMethod; params?: any }) => Promise<unknown>;
  _metamask: {
    isUnlocked: boolean;
  };
}

export interface PhantomInjectedProvider {
  ethereum: PhantomEthereumProvider;
  solana: PhantomSolanaProvider;
}

export type Status = 'success' | 'warning' | 'error' | 'info';

export interface TLog {
  providerType: PhantomProviderType;
  status: Status;
  method?: PhantomRequestMethod | Extract<PhantomEvent, 'accountChanged'>;
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
  EthereumMainnet = 'Ethereum',
  EthereumGoerli = 'Ethereum Goerli',
  PolygonMainnet = 'Polygon',
  PolygonMumbai = 'Polygon Mumbai',
  SolanaMainnet = 'Solana',
  SolanaTestnet = 'Solana Testnet',
  SolanaDevnet = 'Solana Devnet',
}

export enum SupportedChainIcons {
  Ethereum = 'https://api.phantom.app/image-proxy/?image=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Ftrustwallet%2Fassets%40master%2Fblockchains%2Fethereum%2Fassets%2F0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2%2Flogo.png&fit=cover&width=88&height=88',
  Polygon = 'https://api.phantom.app/image-proxy/?image=https%3A%2F%2Fwallet-asset.matic.network%2Fimg%2Ftokens%2Fmatic.svg&fit=cover&width=88&height=88',
  Solana = 'https://api.phantom.app/image-proxy/?image=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Fsolana-labs%2Ftoken-list%40main%2Fassets%2Fmainnet%2FSo11111111111111111111111111111111111111112%2Flogo.png&fit=cover&width=88&height=88',
}
