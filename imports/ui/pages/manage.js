// NPM
import d3 from 'd3';
import drawOrderbook from 'order-book-visualisation';
// Meteor
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
// Collections
import { Cores } from '/imports/api/cores';
import { Orders } from '/imports/api/orders.js';
// Utils
import { convertFromTokenPrecision } from '/imports/lib/assets/utils/functions.js';
// Components
import '/imports/ui/components/manage/manage_holdings.js';
import '/imports/ui/components/manage/manage_overview.js';
import '/imports/ui/components/manage/open_orders.js';
import '/imports/ui/components/manage/orderbook_contents.js';
import '/imports/ui/components/manage/recent_trades.js';
// Corresponding html file
import './manage.html';


const calcCumulativeVolume = (currentOrder) => {
  let lowerThanCurrent = true;
  return Orders.find({
    isActive: true,
    'buy.price': { $lte: currentOrder.buy.price },
    'buy.symbol': currentOrder.buy.symbol,
    'sell.symbol': currentOrder.sell.symbol,
  }, {
    sort: {
      'buy.price': 1,
      'buy.howMuch': 1,
      createdAt: 1,
    },
  }).fetch()
  .reduce((accumulator, currentValue) => {
    const cumulativeVolume = lowerThanCurrent
      ? accumulator + currentValue.buy.howMuch
      : accumulator;

    if (currentValue._id === currentOrder._id) { lowerThanCurrent = false; }

    return cumulativeVolume;
  }, 0);
};

Template.manage.onCreated(() => {});

Template.manage.helpers({});

Template.manage.onRendered(function () {
  $('select').select2();
  const templateInstance = this;

  // Wait until all Session variables are set to ensure that #charts is in the DOM
  Tracker.autorun(() => {
    if (Session.get('isClientConnected')
        && Session.get('clientManagerAccount') !== ''
        && Session.get('network') === 'Kovan'
        && Cores.find({ owner: Session.get('clientManagerAccount') }).count() > 0) {
      // Defer execution until next tick. I.e. after the DOM is updated

      const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');

      const allOrders = Orders.find({
        isActive: true,
        'buy.symbol': { $in: [baseTokenSymbol, quoteTokenSymbol] },
        'sell.symbol': { $in: [baseTokenSymbol, quoteTokenSymbol] },
      }, {
        sort: {
          'buy.symbol': 1,
          'buy.price': 1,
          'buy.howMuch': 1,
          createdAt: 1,
        },
      }).map(order => ({
        buyPrice: order.buy.price,
        buySymbol: order.buy.symbol,
        buyHowMuch: convertFromTokenPrecision(order.buy.howMuch, order.buy.precision),
        cumulativeVolume: convertFromTokenPrecision(
          calcCumulativeVolume(order),
          order.buy.precision,
        ),
      }));

      console.log(allOrders);

      Meteor.defer(() => {
        const svg = d3.select('svg.js-charts');

        const data = allOrders.map(o => ({
          price: o.buyPrice,
          total: o.buyHowMuch,
          type: o.buySymbol === baseTokenSymbol ? 'ask' : 'bid',
        }));

        console.log(d3.min(data, d => d.price), d3.max(data, d => d.price));

        drawOrderbook(data, svg, d3);
      });
    }
  });
});

