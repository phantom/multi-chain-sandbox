import { PublicKey, SendOptions, Transaction, VersionedTransaction } from '@solana/web3.js';

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

/**
 * A subset of Phantom's supported JSON RPC methods
 * Phantom accepts most JSON RPC requests that are expected of wallets
 * For more information, please see: https://ethereum.org/en/developers/docs/apis/json-rpc/
 */
type EthereumRequestMethod =
  | 'eth_getTransactionReceipt'
  | 'eth_sendTransaction'
  | 'eth_requestAccounts'
  | 'personal_sign'
  | 'eth_accounts'
  | 'eth_chainId'
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
    opts?: SendOptions,
  ) => Promise<{ signature: string; publicKey: PublicKey }>;
  signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>;
  signAllTransactions: (
    transactions: (Transaction | VersionedTransaction)[],
  ) => Promise<(Transaction | VersionedTransaction)[]>;
  signMessage: (message: Uint8Array | string, display?: DisplayEncoding) => Promise<any>;
  connect: (opts?: Partial<SolanaConnectOptions>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: SolanaEvent, handler: (args: any) => void) => void;
  request: (method: SolanaRequestMethod, params: any) => Promise<unknown>;
}

// TODO _events and _eventsCount
export interface PhantomEthereumProvider {
  isMetaMask?: boolean; // will be removed after beta
  isPhantom: boolean;
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
  PolygonMainnet = '0x89',
  PolygonMumbai = '0x13881',
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

export enum SupportedChainIcons {
  Ethereum = '/images/ethereum.png',
  Polygon = '/images/polygon.png',
  Solana = '/images/solana.png',
}
