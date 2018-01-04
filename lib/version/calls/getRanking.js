import getRankingContract from "../contracts/getRankingContract";
import getVersionContract from "../contracts/getVersionContract";
import getFundContract from "../../fund/contracts/getFundContract";

import getFundInformations from "../../fund/calls/getFundInformations";
import toReadable from "../../assets/utils/toReadable";

/**
 * Returns an array of all existing funds on current Version, sorted by share price in descending order, with informations such as address, name, share price, and inception date.
 */
const getRanking = async () => {
  const versionContract = await getVersionContract();
  const lastFundId = await versionContract.instance.getLastFundId.call();

  const getRankingPromises = new Array(lastFundId.toNumber())
    .fill(undefined)
    .map(async (val, index) => {
      const fundAddress = await versionContract.instance.getFundById.call({}, [
        index,
      ]);
      const fundContract = await getFundContract(fundAddress);
      const fundSharePrice = await fundContract.instance.calcSharePrice.call();
      const fundInformations = await getFundInformations(fundAddress);
      return {
        address: fundAddress,
        name: fundInformations.name,
        sharePrice: toReadable(fundSharePrice, "MLN-T"),
        inception: fundInformations.inception,
      };
    });

  const unsortedFunds = await Promise.all(getRankingPromises);
  return unsortedFunds.sort((a, b) => (a.sharePrice > b.sharePrice ? -1 : 1));
};

export default getRanking;

// TODO: investigate why call to ranking contract work in melon.js but not in frontend. see below
// import getRankingContract from "../contracts/getRankingContract";
// import getVersionContract from "../contracts/getVersionContract";
// import getFundInformations from "../../fund/calls/getFundInformations";
// import toReadable from "../../assets/utils/toReadable";

// /**
//  * Returns an array of all existing funds on current Version, sorted by share price in descending order, with informations such as address, name, share price, and inception date.
//  */
// const getRanking = async () => {
//   const rankingContract = await getRankingContract();

//   const output = await rankingContract.instance.getFundsSharePrices.call();
//   const fundAddresses = output[0].map(fund => fund._value);
//   const fundSharePrices = output[1].map(fund =>
//     toReadable(fund._value, "MLN-T").toNumber(),
//   );
//   const versionContract = await getVersionContract();
//   const lastFundId = await versionContract.instance.getLastFundId.call();

//   const getRankingPromises = new Array(lastFundId.toNumber())
//     .fill(undefined)
//     .map(async (val, index) => {
//       const fundInformations = await getFundInformations(fundAddresses[index]);
//       return {
//         address: fundAddresses[index],
//         name: fundInformations.name,
//         sharePrice: fundSharePrices[index],
//         inception: fundInformations.inception,
//       };
//     });

//   const unsortedFunds = await Promise.all(getRankingPromises);
//   console.log("from melon.js ", unsortedFunds);
//   return unsortedFunds.sort((a, b) => (a.sharePrice > b.sharePrice ? -1 : 1));
// };

// export default getRanking;
