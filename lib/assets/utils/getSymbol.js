// @flow
import tokenInfo from "./tokenInfo";

import getConfig from "../../version/calls/getConfig";

import type { Address } from "../schemas/Address";
import type { TokenSymbol } from "../schemas/TokenSymbol";

const getTokenInfoByAddress = async (address: string): any => {
  address = address.toLowerCase();

  const config = await getConfig();

  for (const asset of config.assets) {
    if (asset.address.toLowerCase() == address) {
      return asset;
    }
  }

  throw Error(`No token found with address ${address}`);
};

/**
 * Gets the token symbol by its ERC20 `address`
 */
const getSymbol = async (address: Address): TokenSymbol => {
  const token = await getTokenInfoByAddress(address);
  return token.name;
};

export default getSymbol;
