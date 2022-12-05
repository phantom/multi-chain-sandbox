const switchEthereumChain = async (provider, chainId) => {
  try {
    const response = await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
    return response;
  } catch (error) {
    console.warn(error);
    throw new Error(error.message);
  }
};

export default switchEthereumChain;
