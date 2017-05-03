const constants = require('./constants.js');
const specs = require('./specs.js');
const async = require('async');

// // SMART-CONTRACT IMPORT
//
// import contract from 'truffle-contract';
// import ExchangeJson from '/imports/lib/assets/contracts/Exchange.json'; // Get Smart Contract JSON
// const Exchange = contract(ExchangeJson); // Set Provider
// Exchange.setProvider(web3.currentProvider);
// const KOVAN_NETWORK_ID = 42; // TODO persistent network id
// // const EXCHANGE_ADDR = Exchange.networks[KOVAN_NETWORK_ID].address;
// const EXCHANGE_ADDR = 0x442Fd95C32162F914364C5fEFf27A0Dc05214706;
//
// // OFFERS
//
// // Pre:
// // Post:
// export function syncOrder(id, callback) {
//   Exchange.at(EXCHANGE_ADDR).orders(id)
//   .then((res) => {
//     const [sellHowMuch, sellWhichTokenAddress, buyHowMuch, buyWhichTokenAddress, owner, active] = res;
//     if (active) {
//       const sellPrecision = specs.getTokenPrecisionByAddress(sellWhichTokenAddress);
//       const buyPrecision = specs.getTokenPrecisionByAddress(buyWhichTokenAddress);
//       const sellSymbol = specs.getTokenSymbolByAddress(sellWhichTokenAddress);
//       const buySymbol = specs.getTokenSymbolByAddress(buyWhichTokenAddress);
//       const buyHowMuchValue = buyHowMuch / (Math.pow(10, buyPrecision));
//       const sellHowMuchValue = sellHowMuch / (Math.pow(10, sellPrecision));
//       const order = {
//         id,
//         owner,
//         buyWhichTokenAddress,
//         buyWhichToken: buySymbol,
//         sellWhichTokenAddress,
//         sellWhichToken: sellSymbol,
//         buyHowMuch: buyHowMuchValue.toString(10),
//         sellHowMuch: sellHowMuchValue.toString(10),
//         ask_price: buyHowMuchValue / sellHowMuchValue,
//         bid_price: sellHowMuchValue / buyHowMuchValue,
//       };
//       callback(null, order);
//     } else {
//       callback('Not active', undefined);
//     }
//   });
// };
//
// // Pre:
// // Post:
// export function sync(callback) {
//   Exchange.at(EXCHANGE_ADDR).lastOrderId()
//   .then((result) => {
//     const numOrders = result.toNumber();
//     console.log(`numOrders: ${numOrders}`)
//     async.times(numOrders, (id, callbackMap) => {
//       syncOrder(id + 1, (err, order) => {
//         if (!err) {
//           callbackMap(null, order);
//         } else if (err == 'Not active') {
//           callbackMap(null, undefined);
//         } else {
//           callbackMap(err, undefined);
//         }
//       });
//     }, (err, orders) => {
//       callback(null, orders);
//     });
//   });
// };
