import { PhantomEthereumProvider } from '../../types';
import { ethers } from 'ethers';
import erc721ABI from '../../static/abis/erc721.abi.json';

class ERC721Contract {
  private contract;

  constructor(provider: PhantomEthereumProvider) {
    // BAYC: https://etherscan.io/token/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d
    const ethersProvider = new ethers.providers.Web3Provider(provider as ethers.providers.ExternalProvider);
    this.contract = new ethers.Contract(
      '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
      erc721ABI,
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
export default ERC721Contract;
