import Api from "@parity/api";
import providers from "../constants/providers";

const checkHttpProvider = url => {
  const provider = new Api.Provider.Http(url);
  return provider._connected ? provider : null;
};

const getParityProvider = () => {
  // TODO: First check for the local provider + async?
  let httpProvider = checkHttpProvider("https://kovan.melonport.com");
  let providerType;

  if (httpProvider) {
    providerType = providers.LOCAL;
  } else {
    httpProvider = checkHttpProvider("http://localhost:8545");
    if (httpProvider) {
      providerType = providers.HOSTED;
    } else {
      providerType = providers.NONE;
    }
  }
  const api = new Api(httpProvider);
  return { provider: httpProvider, providerType, api };
};

export default getParityProvider;
