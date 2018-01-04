// @flow
import BigNumber from "bignumber.js";

import setup from "../../utils/setup";
import Api from "@parity/api";

import type { TokenSymbol } from "../schemas/TokenSymbol";

const transferEther = async (
  wallet,
  toAddress: Address,
  quantity: BigNumber,
  from: Address = setup.defaultAccount,
): boolean => {
  const api = new Api(setup.provider);

  const transactionCount = await api._eth.getTransactionCount(
    setup.defaultAccount,
  );

  const options = {
    from,
    to: toAddress,
    gasPrice: 20000000000,
    nonce: `0x${transactionCount.toString(16)}`,
    value: `0x${quantity.toString(16)}`,
  };

  const gasLimit = await api._eth.estimateGas(options);
  options.gasLimit = `0x${gasLimit.toString(16)}`;

  const signedTransaction = wallet.sign(options);
  await api._eth.sendRawTransaction(signedTransaction);
};

export default transferEther;
