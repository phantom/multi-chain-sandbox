import { PhantomEthereumProvider, TLog } from '../types';

const POLLING_INTERVAL = 3000; // three seconds
const MAX_POLLS = 10;

interface TransactionReceipt {
  blockHash: string;
  blockNumber: string;
  contractAddress: null;
  cumulativeGasUsed: string;
  effectiveGasPrice: string;
  from: string;
  gasUsed: string;
  logs: any[];
  logsBloom: string;
  status: string;
  to: string;
  transactionHash: string;
  transactionIndex: string;
  type: string;
}

/**
 * Polls for transaction receipt
 * @param   {String}     txHash  a transaction hash
 * @param   {PhantomEthereumProvider} provider a Phantom ethereum provider
 * @param   {Function}   createLog  a function to create log
 * @returns
 */
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

    // @ts-ignore:next-line
    const txReceipt: TransactionReceipt = await provider.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash],
    });

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

    // @ts-ignore:next-line
    const { status, blockNumber } = txReceipt;

    // Transaction is confirmed
    if (status === '0x1') {
      createLog({
        providerType: 'ethereum',
        status: 'success',
        method: 'eth_sendTransaction',
        message: `Transaction: ${txHash}`,
        messageTwo: `Status: Confirmed in block: ${parseInt(blockNumber)}`,
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
