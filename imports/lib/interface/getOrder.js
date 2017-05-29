import contract from 'truffle-contract';

import web3 from '/imports/lib/ethereum/isomorphic-web3';
import AddressList from '/imports/lib/ethereum/address_list';
import ExchangeJson from '/imports/lib/assets/contracts/Exchange.json';
import specs from '/imports/lib/assets/utils/specs.js';


const Exchange = contract(ExchangeJson);
Exchange.setProvider(web3.currentProvider);
const exchangeContract = Exchange.at(AddressList.Exchange); // Initialize contract instance


const getOrder = id =>
  exchangeContract.orders(id).then((order) => {
    const [sellHowMuch,
      sellWhichToken,
      buyHowMuch,
      buyWhichToken,
      timestamp,
      owner,
      isActive,
    ] = order;
    const buyPrecision = specs.getTokenPrecisionByAddress(buyWhichToken);
    const sellPrecision = specs.getTokenPrecisionByAddress(sellWhichToken);
    const buySymbol = specs.getTokenSymbolByAddress(buyWhichToken);
    const sellSymbol = specs.getTokenSymbolByAddress(sellWhichToken);
    const sellPrice = buyHowMuch / (sellHowMuch * Math.pow(10, sellPrecision - buyPrecision));
    const buyPrice = sellHowMuch / (buyHowMuch * Math.pow(10, buyPrecision - sellPrecision));

    return {
      id,
      owner,
      isActive,
      buy: {
        token: buyWhichToken,
        symbol: buySymbol,
        howMuch: buyHowMuch.toNumber(),
        howMuchPrecise: buyHowMuch.toString(),
        precision: buyPrecision,
        price: buyPrice,
      },
      sell: {
        token: sellWhichToken,
        symbol: sellSymbol,
        howMuch: sellHowMuch.toNumber(),
        howMuchPrecise: sellHowMuch.toString(),
        precision: sellPrecision,
        price: sellPrice,
      },
      timestamp,
    };
  });


export default getOrder;
