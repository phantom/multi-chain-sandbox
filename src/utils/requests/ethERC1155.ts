import { PhantomEthereumProvider } from '../../types';
import { ethers } from 'ethers';
import erc1155ABI from '../../static/abis/erc1155.abi.json';

class ERC1155Contract {
  private contract;

  constructor(provider: PhantomEthereumProvider) {
    // RTFKT X Nike: https://etherscan.io/token/0x6d4bbc0387dd4759eee30f6a482ac6dc2df3facf
    const ethersProvider = new ethers.providers.Web3Provider(provider as ethers.providers.ExternalProvider);
    this.contract = new ethers.Contract(
      '0x6d4bbc0387dd4759eee30f6a482ac6dc2df3facf',
      erc1155ABI,
      ethersProvider.getSigner()
    );
  }

  async approve(address, amount = 1) {
    try {
      const txHash = await this.contract.approve(address, amount);
      if (typeof txHash === 'string') return txHash;
      throw new Error('did not get back a transaction hash');
    } catch (error) {
      console.warn(error);
      throw new Error(error.message);
    }
  }

  async revoke(address) {
    return this.approve(address, 0);
  }
}
export default ERC1155Contract;
