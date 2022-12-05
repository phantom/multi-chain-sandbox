// =============================================================================
// Colors
// =============================================================================

import { SupportedChainIcons, SupportedChainNames, SupportedEVMChainIds, SupportedSolanaChainIds } from './types';

export const RED = '#EB3742';
export const YELLOW = '#FFDC62';
export const GREEN = '#21E56F';
export const BLUE = '#59cff7';
export const PURPLE = '#8A81F8';
export const WHITE = '#FFFFFF';
export const GRAY = '#777777';
export const REACT_GRAY = '#222222';
export const DARK_GRAY = '#333333';
export const LIGHT_GRAY = '#444444';
export const BLACK = '#000000';

export const SUPPORTED_ETHEREUM_CHAIN_IDS = {
  ethereumMainnet: '0x1',
  ethereumGoerli: '0x5',
  polygonMainnet: '0x137',
  polygonMumbai: '0x80001',
};

export const ETHEREUM_MAINNET_CHAIN_ID = '0x1';
export const ETHEREUM_GOERLI_CHAIN_ID = '0x5';
export const POLYGON_MAINNET_CHAIN_ID = '0x137';
export const POLYGON_MUMBAI_CHAIN_ID = '0x80001';

export const ETHEREUM_ICON =
  'https://api.phantom.app/image-proxy/?image=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Ftrustwallet%2Fassets%40master%2Fblockchains%2Fethereum%2Fassets%2F0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2%2Flogo.png&fit=cover&width=88&height=88';
export const POLYGON_ICON =
  'https://api.phantom.app/image-proxy/?image=https%3A%2F%2Fwallet-asset.matic.network%2Fimg%2Ftokens%2Fmatic.svg&fit=cover&width=88&height=88';
export const SOLANA_ICON =
  'https://api.phantom.app/image-proxy/?image=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2Fsolana-labs%2Ftoken-list%40main%2Fassets%2Fmainnet%2FSo11111111111111111111111111111111111111112%2Flogo.png&fit=cover&width=88&height=88';

export const SUPPORTED_CHAINS = {
  [SupportedEVMChainIds.EthereumMainnet]: {
    name: SupportedChainNames.EthereumMainnet,
    icon: SupportedChainIcons.Ethereum,
  },
  [SupportedEVMChainIds.EthereumGoerli]: {
    name: SupportedChainNames.EthereumGoerli,
    icon: SupportedChainIcons.Ethereum,
  },
  [SupportedEVMChainIds.PolygonMainnet]: {
    name: SupportedChainNames.PolygonMainnet,
    icon: SupportedChainIcons.Polygon,
  },
  [SupportedEVMChainIds.PolygonMumbai]: {
    name: SupportedChainNames.PolygonMumbai,
    icon: SupportedChainIcons.Polygon,
  },
  [SupportedSolanaChainIds.SolanaMainnet]: {
    name: SupportedChainNames.SolanaMainnet,
    icon: SupportedChainIcons.Solana,
  },
  [SupportedSolanaChainIds.SolanaTestnet]: {
    name: SupportedChainNames.SolanaTestnet,
    icon: SupportedChainIcons.Solana,
  },
  [SupportedSolanaChainIds.SolanaDevnet]: {
    name: SupportedChainNames.SolanaDevnet,
    icon: SupportedChainIcons.Solana,
  },
};
