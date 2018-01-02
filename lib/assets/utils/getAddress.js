// @flow
import getTokenInfo from "./getTokenInfo";

import type { Address } from "../schemas/Address";
import type { TokenSymbol } from "../schemas/TokenSymbol";

/**
 * Gets address of given `tokenSymbol`
 */
const getAddress = async (tokenSymbol: TokenSymbol): Address => {
  const token = await getTokenInfo(tokenSymbol);
  return token.address.toLowerCase();
};

export default getAddress;
