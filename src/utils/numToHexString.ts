/**
 * Returns a hex string from a number
 * @param   {Number} num   a number
 * @returns {String}       a hex string
 */
const numToHexString = (num: number) => {
  return '0x' + Number(num).toString(16);
};

export default numToHexString;
