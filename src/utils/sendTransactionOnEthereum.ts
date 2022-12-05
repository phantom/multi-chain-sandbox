import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { utils } from 'ethers';
import getGasPrice from './getGasPrice';
import getTransactionCount from './getTransactionCount';

const toHex = (num) => {
  const val = Number(num);
  return '0x' + val.toString(16);
};

const sendTransactionOnEthereum = async (provider) => {
  try {
    const gasPrice = await getGasPrice(provider);
    const nonce = await getTransactionCount(provider, provider.selectedAddress, 'latest');
    const value = utils.parseUnits('1', 'wei')._hex;
    const gas = utils.hexlify(100000);
    console.log('== sendTransactionOnEthereum Values ==');
    console.log('gasPrice: ', gasPrice);
    console.log('nonce: ', nonce);
    console.log('value: ', value);
    console.log('gas: ', gas);
    console.log('gasTwo: ', toHex(100000));

    // const signer = provider.getSigner();
    // const address = await signer.getAddress();
    // const gasPrice = await provider.getGasPrice();
    // const transactionParameters = {
    //   from: provider.selectedAddress, // must match user's active address.
    //   gasPrice,
    //   data: '0x4533',
    // };
    // const transactionParameters = {
    //   nonce, // ignored by Phantom
    //   gasPrice, // customizable by user during confirmation.
    //   // gas: utils.hexlify(100000),
    //   gas: '0x2710',
    //   // gasLimit: utils.hexlify(100000),
    //   to: provider.selectedAddress, // Required except during contract publications.
    //   from: provider.selectedAddress, // must match user's active address.
    //   value: '0x00',
    //   // value: utils.parseUnits('1', 'wei'), // Only required to send ether to the recipient from the initiating external account.
    //   data: '0x2208b07b3c285f9998749c90d270a61c63230983054b5cf1ddee97ea763d3b22', // optional arbitrary hex data
    //   chainId: provider.chainId,
    // };

    const transactionParameters = {
      from: provider.selectedAddress,
      to: provider.selectedAddress,
      // gas,
      // gas: toHex(100000),
      gas: '0x76c0',
      // gasPrice: '0x9184e72a000',
      gasPrice,
      // value,
      value: '0x9184e72a',
      // data: '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
    };

    console.log('-- transactionParameters --');
    console.log(transactionParameters);
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });
    return txHash;
  } catch (error) {
    console.warn(error);
    throw new Error(error.message);
  }
};

export default sendTransactionOnEthereum;
