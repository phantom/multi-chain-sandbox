const getGasPrice = async (provider) => {
  try {
    const gasPrice = await provider.request({
      method: 'eth_gasPrice',
    });
    return gasPrice;
  } catch (error) {
    console.warn(error);
    throw new Error(error.message);
  }
};

export default getGasPrice;
