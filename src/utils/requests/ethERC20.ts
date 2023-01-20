import { PhantomEthereumProvider } from '../../types';
import { ethers } from 'ethers';
import erc20ABI from '../../static/abis/erc20.abi.json';

class ERC20Contract {
  private contract;

  constructor(provider: PhantomEthereumProvider) {
    // SUSHI: https://etherscan.io/token/0x6b3595068778dd592e39a122f4f5a5cf09c90fe2
    const ethersProvider = new ethers.providers.Web3Provider(provider as ethers.providers.ExternalProvider);
    this.contract = new ethers.Contract(
      '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
      erc20ABI,
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
export default ERC20Contract;
