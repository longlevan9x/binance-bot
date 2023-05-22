require('dotenv').config();

const Binance = require('node-binance-api');

const binanceClient = new Binance().options({
    APIKEY: process.env.BINANCE_APIKEY,
    APISECRET: process.env.BINANCE_APISECRET,
    useServerTime: true, // Optional: Use the server time for requests
    // test: true // Enable testnet environment
});

module.exports = binanceClient;