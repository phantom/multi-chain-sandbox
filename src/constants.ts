import { SupportedChainIcons, SupportedChainNames, SupportedEVMChainIds, SupportedSolanaChainIds } from './types';

// =============================================================================
// Colors
// =============================================================================
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

// =============================================================================
// Chains
// =============================================================================

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
