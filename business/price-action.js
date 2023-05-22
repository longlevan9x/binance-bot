const binanceClient = require('../configs/binance');
const math = require('mathjs');

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
