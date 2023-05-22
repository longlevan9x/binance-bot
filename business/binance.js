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

// for price action
function calculatePriceLevels(candles) {
    const highs = candles.map((candle) => parseFloat(candle[4]));
    const lows = candles.map((candle) => parseFloat(candle[4]));

    const highHigh = Math.max(...highs);
    const highHigh2 = Math.max(...highs.filter((high) => high !== highHigh));
    const low1 = Math.min(...lows);
    const bottom2 = Math.min(...lows.filter((low) => low !== low1));

    return {highHigh, highHigh2, low1, bottom2};
}


async function priceAction() {
    try {
        const symbol = 'BTCUSDT'; // Symbol of the cryptocurrency you want to analyze
        const interval = '5m';
        const limit = 8; // Assuming each candle represents 15 minutes, 8 candles represent 2 hours
// Function to calculate the high-high, high-high 2, low 1, and bottom 2

// Fetch the candlestick data from Binance
        let ticks = await binanceClient.candlesticks(symbol, interval, (error, candles) => {
            if (error) {
                console.error('Error retrieving candlestick data:', error);
                return;
            }

            let _x = candles.map(c => {
                c[12] = new Date(c[0]).toLocaleString();
                c[13] = new Date(c[6]).toLocaleString();
                return c;
            });

            _x.forEach(x1 => console.log(x1))
// Get the candle from approximately 2 hours ago
            const candleIndex = 2; // Adjust this index as per your requirement

            console.log(candles.length, new Date(candles[candleIndex][0]).toString())
            if (candles.length >= candleIndex) {
                const candle = candles[candleIndex];
                // console.log('Candle:', candle);

                // Perform price action analysis on the retrieved candle
                const [openTime, open, high, low, close] = candle;

                if (close > open) {
                    console.log('Bullish candle');
                } else if (close < open) {
                    console.log('Bearish candle');
                } else {
                    console.log('Neutral candle');
                }

                // Determine the high, high2, low1, and low2 levels
                const [prevCandle, currentCandle] = candles.slice(candleIndex - 1, candleIndex + 1);

                const highLevel = Math.max(parseFloat(prevCandle[2]), parseFloat(currentCandle[2]));
                const lowLevel = Math.min(parseFloat(prevCandle[3]), parseFloat(currentCandle[3]));

                console.log('High Level:', highLevel);
                console.log('Low Level:', lowLevel);

                // Continue with further analysis or execute trading logic
            } else {
                console.log('Insufficient candle data available');
            }
        }, {limit: limit});

        return;
        console.table(ticks[0])
        // Filter the data to only include the open, high, low, and close prices
        const candles = ticks.map((tick) => [tick[0], parseFloat(tick[1]), parseFloat(tick[2]), parseFloat(tick[3]), parseFloat(tick[4])]);

        // Calculate the price levels
        const {highHigh, highHigh2, low1, bottom2} = calculatePriceLevels(candles);
        console.log('High High:', highHigh);
        console.log('High High 2:', highHigh2);
        console.log('Low 1:', low1);
        console.log('Bottom 2:', bottom2);

        // Get the candle from approximately 2 hours ago
        const candleIndex = 2; // Adjust this index as per your requirement

        if (ticks.length >= candleIndex) {
            const candle = ticks[candleIndex];
            console.log('Candle:', candle);
            // Perform further calculations or analysis on the retrieved candle
        } else {
            console.log('Insufficient candle data available');
        }
    } catch (e) {
        console.error(e);
    }
}

const nodeCron = require("node-cron");

// const job = nodeCron.schedule("* * * * * *", buyAndSell, {
//     scheduled: false, timezone: "Asia/Ho_Chi_Minh"
// });
const job = nodeCron.schedule("* * * * * *", priceAction, {
    scheduled: false, timezone: "Asia/Ho_Chi_Minh"
});
//
job.start();
//
job.stop();
