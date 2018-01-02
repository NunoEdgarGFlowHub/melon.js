// @flow
import getTokenInfo from "./getTokenInfo";

import type { TokenSymbol } from "../schemas/TokenSymbol";

/**
 * Gets decimals of given `tokenSymbol`
 */
const getDecimals = async (tokenSymbol: TokenSymbol): number => {
  const token = await getTokenInfo(tokenSymbol);
  return token.decimal;
};

export default getDecimals;
