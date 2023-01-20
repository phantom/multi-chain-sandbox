import { ethers } from 'ethers';
import { PhantomEthereumProvider } from '../types';
import { getEthereumSelectedAddress } from './getEthereumSelectedAddress';

/**
 * Signs a message on Ethereum
 * @param provider a Phantom ethereum provider
 * @param message a message to sign
 * @returns a signed message is hex string format
 */
const signTypedMessageOnEthereum = async (
  version: 'v1' | 'v3' | 'v4',
  provider: PhantomEthereumProvider
): Promise<string> => {
  try {
    const selectedAddress = await getEthereumSelectedAddress(provider);

    let signedMessage;

    switch (version) {
      case 'v1':
        signedMessage = await signTypedMessageV1(selectedAddress, provider);
        break;
      case 'v3':
        signedMessage = await signTypedMessageV3(selectedAddress, provider);
        break;
      case 'v4':
        signedMessage = await signTypedMessageV4(provider);
        break;
    }

    if (typeof signedMessage === 'string') return signedMessage;
    throw new Error('personal_sign did not respond with a signature');
  } catch (error) {
    console.warn(error);
    throw new Error(error.message);
  }
};

const msgParams = {
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  },
  primaryType: 'Mail',
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
};

const signTypedMessageV1 = async (selectedAddress: string, provider: PhantomEthereumProvider) => {
  return provider.request({
    method: 'eth_signTypedData',
    params: [selectedAddress, msgParams],
  });
};

// https://eips.ethereum.org/assets/eip-712/Example.js
const signTypedMessageV3 = async (selectedAddress: string, provider: PhantomEthereumProvider) => {
  return provider.request({
    method: 'eth_signTypedData_v3',
    params: [selectedAddress, msgParams],
  });
};

const signTypedMessageV4 = async (provider: PhantomEthereumProvider) => {
  const ethersProvider = new ethers.providers.Web3Provider(provider as ethers.providers.ExternalProvider);
  return ethersProvider.getSigner()._signTypedData(msgParams.domain, msgParams.types, msgParams.message);
};

export default signTypedMessageOnEthereum;
