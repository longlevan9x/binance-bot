const binanceClient = require('../configs/binance');
const math = require('mathjs');

function depth(symbol) {
    binanceClient.depth(symbol, (error, depth) => {
        if (error) {
            console.error("depth", error);
            return;
        }

        console.log('Order Book Depth:');
        // console.log(depth);
    });
}

function price(symbol) {
    return binanceClient.prices(symbol).then(ticker => ticker[symbol])
}

function candlesticks(symbol) {
    binanceClient.candlesticks(symbol, '1m', (error, ticks) => {
        if (error) {
            console.error(error);
            return;
        }

        console.log('Candlestick Data for BTCUSDT:');
        // console.table(ticks);
    });
}

function trades(symbol) {
    binanceClient.trades(symbol, (error, trades) => {
        if (error) {
            console.error(error);
            return;
        }

        console.log('Recent Trades for BTCUSDT:');
        console.log(trades);
    });

}

function ticker(symbol) {
    return new Promise((resolve, reject) => {
        binanceClient.ticker(symbol, (error, ticker) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(ticker);
        });
    })

}

function account() {
    binanceClient.account((error, accountInfo) => {
        if (error) {
            console.error(error);
            return;
        }

        console.log('Account Information:', accountInfo);
        console.log(accountInfo);
    });
}

function myTrades(symbol) {
    binanceClient.myTrades(symbol, (error, trades) => {
        if (error) {
            console.error(error);
            return;
        }

        console.log('Trade History for BTCUSDT:');
        console.log(trades);
    });

}

function order(symbol, quantity) {
    const side = 'BUY';
    const price = 40000;
    binanceClient.order(symbol, side, quantity, price, (error, orderResponse) => {
        if (error) {
            console.error(error);
            return;
        }

        console.log('Order Placed Successfully.');
        console.log('Order Response:', orderResponse);
    });

}

function orderStatus(symbol, orderId) {
    // Now you can track the order status using the order ID
    binanceClient.orderStatus(symbol, orderId, (error, orderStatus) => {
        if (error) {
            console.error('orderStatus', error);
            return;
        }

        console.log('Order Status:', orderStatus);
    });
}

function cancelOrder(symbol, orderId) {
    binanceClient.cancelOrder(symbol, orderId, (error, cancelResponse) => {
        if (error) {
            console.error('cancelOrder', error);
            return;
        }

        console.log('Order Canceled Successfully.');
        console.log('Cancel Response:', cancelResponse);
    });
}

function marketBuy(symbol, quantity, price) {
    const flags = {type: 'MARKET'};
    return binanceClient.marketBuy(symbol, quantity, flags);
}

function openOrders(symbol) {
    binanceClient.openOrders(symbol, (error, openOrders) => {
        if (error) {
            console.error('openOrders', error);
            return;
        }

        console.log('Open Orders:', openOrders);
    });
}

function marketSell(symbol, quantity,) {
    binanceClient.marketSell(symbol, quantity, (error, response) => {
        if (error) {
            console.error(error);
            return;
        }

        console.log('Sell Order Executed Successfully.');
        console.log('Response:', response);
    });
}

function balance() {
    binanceClient.balance((error, balances) => {
        if (error) {
            console.error(error);
            return;
        }

        console.log('Account Balances:');
        // console.table(balances);

        // Step 2: Access the specific balance for a particular asset
        const asset = 'USDT';
        const availableBalance = balances[asset].available;
        const onOrderBalance = balances[asset].onOrder;

        console.log(`Available ${asset} balance: ${availableBalance}`);
        console.log(`On order ${asset} balance: ${onOrderBalance}`);
    });
}

async function exchangeInfo(symbol, quantity, currentPrice) {
    let exchangeInfo = await binanceClient.exchangeInfo();

    const symbolInfo = exchangeInfo.symbols.find(s => s.symbol === symbol);

    const orderTypes = symbolInfo.orderTypes;
    const permissions = symbolInfo.permissions;
    const allowedSelfTradePreventionModes = symbolInfo.allowedSelfTradePreventionModes;
    const filters = symbolInfo.filters;

    // console.log(orderTypes, permissions, allowedSelfTradePreventionModes);
    // console.log('filters', filters);

    // Find the price filter
    const priceFilter = filters.find(f => f.filterType === 'PRICE_FILTER');
    const minPrice = parseFloat(priceFilter.minPrice);

    // Find the lot size filter
    const lotSizeFilter = filters.find(f => f.filterType === 'LOT_SIZE');
    const lotSizeStepSize = parseFloat(lotSizeFilter.stepSize);
    const lotSizeMinQuantity = parseFloat(lotSizeFilter.minQty);
    // console.log(lotSizeFilter, lotSizeStepSize, lotSizeMinQuantity)

    // Retrieve the precision values for quantity and price
    const baseAssetPrecision = symbolInfo.baseAssetPrecision;
    const quotePrecision = symbolInfo.quotePrecision;

    // Calculate the minimum notional value
    // const minNotionalValue = minPrice * quantity;
    const minNotionalValue = currentPrice * quantity;

    const symbolNotional = filters.find(f => f.filterType === 'NOTIONAL');

    const minimumQuantity = symbolNotional.minNotional / currentPrice;
    // console.log(`Minimum Quantity: ${minimumQuantity}`);

    // Check if the order meets the minimum notional value requirement
    if (minNotionalValue < parseFloat(symbolNotional.minNotional)) {
        return {
            message: 'Order does not meet the minimum notional value requirement.',
            minNotionalValue: minNotionalValue,
            symbolNotionalMinNotional: symbolNotional.minNotional,
            minimumQuantityAvailable: minimumQuantity,
            baseAssetPrecision: baseAssetPrecision,
            quotePrecision: quotePrecision,
            lotSizeStepSize: lotSizeStepSize,
            lotSizeMinQuantity: lotSizeMinQuantity,

        };
    }

    return {
        baseAssetPrecision: baseAssetPrecision,
        quotePrecision: quotePrecision,
        lotSizeStepSize: lotSizeStepSize,
        lotSizeMinQuantity: lotSizeMinQuantity,
        minNotionalValue: minNotionalValue,
        symbolNotionalMinNotional: symbolNotional.minNotional,
        minimumQuantityAvailable: minimumQuantity,
    };
}


function executeData() {
    depth();
    price();
    candlesticks();
    trades();
    ticker();
    account();
    myTrades();
    order();
    marketBuy();
    openOrders();
}

async function buyAndSell() {
    try {
        const symbol = 'BNBUSDT';
        // const symbol = 'SHIBUSDT';
        // const symbol = 'BTCUSDT';
        let quantity = 576038;
        // let quantity = 1000000 / 2;
        // const balanceAsset = 'SHIB';
        const balanceAsset = 'BNB';

        const resAccountInfo = await binanceClient.account();
        const myBalanceAsset = resAccountInfo.balances.find((balance) => balance.asset === balanceAsset);
        const myAvailableBalanceAsset = parseFloat(myBalanceAsset.free);

        // get balance
        // const resBalance = await binanceClient.balance();
        // const myBalanceAvailable = resBalance[balanceAsset].available;

        // set balance from account
        const myBalanceAvailable = myAvailableBalanceAsset;

        // get latest price from market
        const latestPrice = await price(symbol);

        let _exchangeInfo = await exchangeInfo(symbol, quantity, latestPrice);
        console.log('_exchangeInfo', _exchangeInfo, 'latestPrice', latestPrice);

        // await buy({symbol, quantity, latestPrice});
        // await sell({symbol, myBalanceAvailable, _exchangeInfo});

    } catch (e) {
        console.error(e.body, {
            requestBody: e.request.body, requestPath: e.request.uri.path
        });
    }
}

async function buy({symbol, quantity, latestPrice, _exchangeInfo} = {}) {
    // if quantity buy less than minimum quantity available set it to minimum
    if (_exchangeInfo.message) {
        quantity = _exchangeInfo.minimumQuantityAvailable;
    }

    console.log('quantity', math.round(quantity, _exchangeInfo.quotePrecision));

// let resBuy = await marketBuy(symbol, quantity);
    let resBuy = await binanceClient.buy(symbol, quantity, latestPrice);
    console.log('resBuy', resBuy);
    let orderId = resBuy.orderId;
    let clientOrderId = resBuy.clientOrderId;
    let resOrderStatus = await binanceClient.orderStatus(symbol, resBuy.orderId);
    console.log('resOrderStatus', resOrderStatus);
    let resCancel = await binanceClient.cancel(symbol, resBuy.orderId);
    console.log('resCancel', resCancel);
}

async function sell({symbol, myBalanceAvailable, _exchangeInfo, quantity} = {}) {
    // for sell
    console.log('lotSize quantity calculate', quantity - _exchangeInfo.lotSizeMinQuantity);
    console.log('lotSize quantity percent', (quantity - _exchangeInfo.lotSizeMinQuantity) % _exchangeInfo.lotSizeStepSize);

    if ((quantity - _exchangeInfo.lotSizeMinQuantity) % _exchangeInfo.lotSizeStepSize !== 0) {
        console.error('Quantity does not meet the lot size requirements');
        return;
    }

    console.log('myBalanceAvailable', myBalanceAvailable)
    // Calculate the valid sale quantity
    const validQuantityForSell = Math.floor(myBalanceAvailable / _exchangeInfo.lotSizeStepSize) * _exchangeInfo.lotSizeStepSize;

    console.log('validQuantity', validQuantityForSell, '_exchangeInfo.lotSizeMinQuantity', _exchangeInfo.lotSizeMinQuantity)
    // Check if the calculated valid quantity is greater than or equal to the minimum quantity
    if (validQuantityForSell < _exchangeInfo.lotSizeMinQuantity) {
        console.error('Calculated valid quantity does not meet the lot size requirements');
        return;
    }

    if (parseFloat(validQuantityForSell) > 0) {
        let resSell = await binanceClient.marketSell(symbol, validQuantityForSell);
        console.log('resSell', resSell);
    }
}

const nodeCron = require("node-cron");

// const job = nodeCron.schedule("* * * * * *", buyAndSell, {
//     scheduled: false, timezone: "Asia/Ho_Chi_Minh"
// });
// const job = nodeCron.schedule("* * * * * *", buyAndSell, {
//     scheduled: false, timezone: "Asia/Ho_Chi_Minh"
// });
// //
// job.start();
// //
// job.stop();
