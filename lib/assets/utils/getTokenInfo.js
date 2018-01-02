// @flow
import tokenInfo from "./tokenInfo";

import getConfig from "../../version/calls/getConfig";

/**
 * Gets the token info by `tokenSymbol`
 * @deprecated Should get token info directly form AssetRegistrar
 * @throws If no token with given symbol is registered
 */
const getTokenInfo = async (tokenSymbol: string): any => {
  tokenSymbol = tokenSymbol.toUpperCase();

  const config = await getConfig();

  for (const asset of config.assets) {
    if (asset.name == tokenSymbol) {
      return asset;
    }
  }

  throw Error(`No token found with symbol ${tokenSymbol}`);
};

export default getTokenInfo;
