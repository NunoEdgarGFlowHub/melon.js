// @flow
import BigNumber from "bignumber.js";

import setup from "../../utils/setup";
import toProcessable from "../../assets/utils/toProcessable";
import getOrder from "../../exchange/calls/getOrder";
import sendTransaction from "../../utils/parity/sendTransaction";
import findEventInLog from "../../utils/ethereum/findEventInLog";
import ensure from "../../utils/generic/ensure";
import getFundContract from "../contracts/getFundContract";

import type { Address } from "../../assets/schemas/Address";

/**
 * Take the order specified by id.
 * @param quantityAsked - The quantity to take from the order. If higher
 *    than the quantity of the order, the order gets executed completely and
 *    the remaining quantity is return.
 */
const takeOrder = (
  wallet,
  id: number,
  vaultAddress: Address,
  quantityAsked: BigNumber,
  from: string = setup.defaultAccount,
): Promise<any> =>
  getOrder(id).then(async order => {
    const fundContract = await getFundContract(vaultAddress);
    const isShutDown = await fundContract.instance.isShutDown.call();
    const owner = await fundContract.instance.owner.call();

    ensure(isShutDown === false, "Fund is shut down");
    ensure(owner.toLowerCase() === from.toLowerCase(), "Not owner of fund");

    // if no quantity specified OR a a specified quantity greater than the selling quantity of the
    // order, execute the full order. Otherwise, execute quantityAsked of the full order.
    const quantity =
      !quantityAsked || quantityAsked.gte(order.sell.howMuch)
        ? order.sell.howMuch
        : quantityAsked;

    const args = [order.id, toProcessable(quantity, order.sell.symbol)];

    const transaction = await sendTransaction(
      fundContract,
      "takeOrder",
      args,
      wallet,
    );

    const updateLog = findEventInLog("OrderUpdated", transaction);
    const updatedOrder = await getOrder(updateLog.params.id.value);

    return transaction
      ? {
          executedQuantity: quantity,
          order: updatedOrder,
        }
      : null;
  });

export default takeOrder;
