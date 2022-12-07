import { toUtf8String } from 'ethers/lib/utils';
import { PhantomEthereumProvider, TLog } from '../types';

const POLLING_INTERVAL = 3000; // three seconds
const MAX_POLLS = 10;

const pollEthereumTransactionReceipt = async (
  txHash: string,
  provider: PhantomEthereumProvider,
  createLog: (log: TLog) => void
): Promise<void> => {
  let count = 0;

  const interval = setInterval(async () => {
    // Failed to confirm transaction in time
    if (count === MAX_POLLS) {
      clearInterval(interval);
      createLog({
        providerType: 'ethereum',
        status: 'error',
        method: 'eth_sendTransaction',
        message: `Transaction: ${txHash}`,
        messageTwo: `Failed to confirm transaction within ${MAX_POLLS} seconds. The transaction may or may not have succeeded.`,
      });
      return;
    }

    const txReceipt = await provider.request({ method: 'eth_getTransactionReceipt', params: [txHash] });

    if (!txReceipt) {
      createLog({
        providerType: 'ethereum',
        status: 'info',
        method: 'eth_sendTransaction',
        message: `Transaction: ${txHash}`,
        messageTwo: `Status: Waiting on confirmation...`,
      });
      count++;
      return;
    }

    console.log('TX RECEIPT: ');
    console.log(txReceipt);

    // @ts-ignore:next-line
    const { status, blockNumber } = txReceipt;

    // Transaction is confirmed
    if (status === '0x1') {
      createLog({
        providerType: 'ethereum',
        status: 'success',
        method: 'eth_sendTransaction',
        message: `Transaction: ${txHash}`,
        messageTwo: `Status: Confirmed in block: ${blockNumber}`,
      });
      clearInterval(interval);
      return;
    } else {
      createLog({
        providerType: 'ethereum',
        status: 'error',
        method: 'eth_sendTransaction',
        message: `Transaction: ${txHash}`,
        messageTwo: `Status: Failed`,
      });
    }
  }, POLLING_INTERVAL);
};

export default pollEthereumTransactionReceipt;

// {blockHash: "0xcc2b74051b01b3fa2372fb2386c3a45af335f5f11c20539036ac0b6819e3f0b7",
// blockNumber: "0x7b65dc",
// contractAddress: null,
// cumulativeGasUsed: "0x18b9630",
// effectiveGasPrice: "0x70816",
// from: "0x3ed5fffe493d4066191d7b7e76784a33defd0018",
// gasUsed: "0x5208",
// logs: [],
// logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
// status: "0x1",
// to: "0x3ed5fffe493d4066191d7b7e76784a33defd0018",
// transactionHash: "0x8df22b12ae758106e1dc95af8cb465909d8f4a3623fe8a11326bd80788b19e74",
// transactionIndex: "0x16",
// type: "0x2"}
