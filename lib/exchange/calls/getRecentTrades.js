// @flow
import Api from "@parity/api";
import BigNumber from "bignumber.js";
import setup from "../../utils/setup";
import getSimpleMarketContract from "../contracts/getSimpleMarketContract";
import getAddress from "../../assets/utils/getAddress";
import toReadable from "../../assets/utils/toReadable";
import getDecimals from "../../assets/utils/getDecimals";

import type { Trade } from "../schemas/Trade";
import type { TokenSymbol } from "../../assets/schemas/TokenSymbol";

/**
 * get all recent trades for a given asset pair `baseTokenSymbol`/
 * `quoteTokenSymbol` in the `inlastXdays`
 */
const getRecentTrades = async (
  baseTokenSymbol: TokenSymbol,
  quoteTokenSymbol: TokenSymbol,
  inlastXdays: number = 1,
): Promise<[Trade]> => {
  const api = new Api(setup.provider);
  const simpleMarketContract = await getSimpleMarketContract();
  const blocksPerDay = 21600;
  const numberOfDays = inlastXdays;

  const blockNumber = await api._eth.blockNumber();

  const hashed = Api.util.sha3(
    "LogTake(bytes32,bytes32,address,address,address,address,uint128,uint128,uint64)",
  );
  const filter = {
    fromBlock: blockNumber.toNumber() - blocksPerDay * numberOfDays,
    toBlock: "latest",
    address: simpleMarketContract.address,
    topics: [hashed],
  };
  const pastEvents = await api._eth.getLogs(filter);
  const decodedLogs = simpleMarketContract.parseEventLogs(pastEvents);

  if (baseTokenSymbol && quoteTokenSymbol) {
    const baseTokenAddress = getAddress(baseTokenSymbol);
    const quoteTokenAddress = getAddress(quoteTokenSymbol);
    const decimalDifference =
      getDecimals(quoteTokenSymbol) - getDecimals(baseTokenSymbol);
    return decodedLogs
      .map(event => {
        const trade = {
          maker: event.params.maker.value,
          taker: event.params.taker.value,
          timestamp: new Date(
            event.params.timestamp.value.times(1000).toNumber(),
          ),
        };
        if (
          event.params.buy_gem.value.toLowerCase() === quoteTokenAddress &&
          event.params.pay_gem.value.toLowerCase() === baseTokenAddress
        ) {
          if (getDecimals(baseTokenSymbol) !== 18) {
            trade.price = new BigNumber(event.params.give_amt.value)
              .div(event.params.take_amt.value)
              .div(10 ** decimalDifference);
          } else {
            trade.price = new BigNumber(event.params.give_amt.value).div(
              event.params.take_amt.value,
            );
          }
          trade.type = "buy";
          trade.quantity = toReadable(
            event.params.take_amt.value,
            baseTokenSymbol,
          );
        } else if (
          event.params.buy_gem.value.toLowerCase() === baseTokenAddress &&
          event.params.pay_gem.value.toLowerCase() === quoteTokenAddress
        ) {
          if (getDecimals(baseTokenSymbol) !== 18) {
            trade.price = new BigNumber(event.params.take_amt.value)
              .div(event.params.give_amt.value)
              .div(10 ** decimalDifference);
          } else {
            trade.price = new BigNumber(event.params.take_amt.value).div(
              event.params.give_amt.value,
            );
          }
          trade.type = "sell";
          trade.quantity = toReadable(
            event.params.give_amt.value,
            baseTokenSymbol,
          );
        } else {
          return null;
        }
        return trade;
      })
      .filter(o => !!o);
  }
  return decodedLogs;
};

export default getRecentTrades;
