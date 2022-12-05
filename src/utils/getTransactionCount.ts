const getTransactionCount = async (provider, address, tag) => {
  try {
    const transactionCount = await provider.request({
      method: 'eth_getTransactionCount',
      params: [address, tag],
    });
    return transactionCount;
  } catch (error) {
    console.warn(error);
    throw new Error(error.message);
  }
};

export default getTransactionCount;
