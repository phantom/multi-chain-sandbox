import { PhantomEthereumProvider } from '../types';
/**
 * Returns the current gas price on the network in wei
 * @param provider a Phantom ethereum provider
 * @returns a gas price in hex string format
 */
const getGasPrice = async (provider: PhantomEthereumProvider): Promise<string> => {
  try {
    const gasPrice = await provider.request({
      method: 'eth_gasPrice',
    });
    if (typeof gasPrice === 'string') return gasPrice;
  } catch (error) {
    console.warn(error);
    throw new Error(error.message);
  }
};

export default getGasPrice;
