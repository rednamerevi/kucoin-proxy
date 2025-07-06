// /api/proxy.js - ერთიანი პროქსი ყველა ბირჟისთვის (სრული ვერსია)

// --- დამხმარე ფუნქციები თითოეული ბირჟისთვის ---

async function handleRequest(apiUrl, exchangeName) {
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(`${exchangeName} API responded with status: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

async function handleOkx(symbol) {
    const data = await handleRequest(`https://www.okx.com/api/v5/market/tickers?instType=SPOT`, 'OKX');
    if (data.code !== '0' || !data.data) throw new Error('OKX API error');
    const ticker = data.data.find(t => t.instId === symbol);
    if (!ticker) throw new Error(`Pair ${symbol} not found in OKX response`);
    return { askPrice: ticker.askPx, bidPrice: ticker.bidPx };
}

async function handleKraken(symbol) {
    const data = await handleRequest(`https://api.kraken.com/0/public/Ticker?pair=${symbol}`, 'Kraken');
    if (data.error && data.error.length > 0) throw new Error(data.error.join(', '));
    const pairKey = Object.keys(data.result)[0];
    const resultPair = data.result[pairKey];
    if (!resultPair) throw new Error('Pair not found on Kraken');
    return { askPrice: resultPair.a[0], bidPrice: resultPair.b[0] };
}

async function handleWhitebit(symbol) {
    const allTickers = await handleRequest(`https://whitebit.com/api/v4/public/ticker`, 'WhiteBIT');
    const specificTicker = allTickers[symbol];
    if (!specificTicker) throw new Error(`Pair ${symbol} not found on WhiteBIT`);
    return { askPrice: specificTicker.ask, bidPrice: specificTicker.bid };
}

async function handleHuobi(symbol) {
    const data = await handleRequest(`https://api.huobi.pro/market/detail/merged?symbol=${symbol}`, 'Huobi (HTX)');
    if (data.status !== 'ok' || !data.tick) throw new Error(`Pair ${symbol} not found on Huobi`);
    return { askPrice: data.tick.ask[0], bidPrice: data.tick.bid[0] };
}

async function handleKucoin(symbol) {
    const data = await handleRequest(`https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${symbol}`, 'KuCoin');
    if (data.code !== '200000' || !data.data) throw new Error(data.msg || 'Pair not found on KuCoin');
    return { askPrice: data.data.bestAsk, bidPrice: data.data.bestBid };
}

async function handleBitmart(symbol) {
    const data = await handleRequest(`https://api-cloud.bitmart.com/spot/v1/ticker?symbol=${symbol}`, 'BitMart');
    if (data.code !== 1000 || !data.data.tickers || data.data.tickers.length === 0) throw new Error('Pair not found on BitMart');
    const ticker = data.data.tickers[0];
    return { askPrice: ticker.best_ask, bidPrice: ticker.best_bid };
}

async function handleGateio(symbol) {
    const data = await handleRequest(`https://api.gateio.ws/api/v4/spot/tickers?currency_pair=${symbol}`, 'Gate.io');
    if (!Array.isArray(data) || data.length === 0) throw new Error('Pair not found on Gate.io');
    return { askPrice: data[0].lowest_ask, bidPrice: data[0].highest_bid };
}

async function handleMexc(symbol) {
    const data = await handleRequest(`https://api.mexc.com/api/v3/ticker/bookTicker?symbol=${symbol}`, 'MEXC');
    return { askPrice: data.askPrice, bidPrice: data.bidPrice };
}

async function handleBitget(symbol) {
    const data = await handleRequest(`https://api.bitget.com/api/v2/spot/market/tickers?symbol=${symbol}`, 'Bitget');
    if (data.code !== "00000" || !data.data || data.data.length === 0) throw new Error(`Pair not found on Bitget`);
    return { askPrice: data.data[0].askPr, bidPrice: data.data[0].bidPr };
}

async function handleXt(symbol) {
    const data = await handleRequest(`https://sapi.xt.com/v4/public/ticker?symbol=${symbol}`, 'XT.com');
    if (data.rc !== 0 || !data.result || data.result.length === 0) throw new Error('Pair not found on XT.com');
    return { askPrice: data.result[0].ap, bidPrice: data.result[0].bp };
}

async function handleHitbtc(symbol) {
    const data = await handleRequest(`https://api.hitbtc.com/api/3/public/ticker/${symbol}`, 'HitBTC');
    return { askPrice: data.ask, bidPrice: data.bid };
}

async function handleAscendex(symbol) {
    const data = await handleRequest(`https://ascendex.com/api/pro/v1/spot/ticker?symbol=${symbol}`, 'AscendEX');
    if (data.code !== 0 || !data.data) throw new Error('Pair not found on AscendEX');
    return { askPrice: data.data.ask[0], bidPrice: data.data.bid[0] };
}

async function handleBitrue(symbol) {
    const data = await handleRequest(`https://openapi.bitrue.com/api/v2/ticker/bookTicker?symbol=${symbol}`, 'Bitrue');
    if (!data || !data.symbol) throw new Error('Pair not found on Bitrue');
    return { askPrice: data.askPrice, bidPrice: data.bidPrice };
}

async function handleUpbit(symbol) {
    const data = await handleRequest(`https://api.upbit.com/v1/orderbook?markets=${symbol}`, 'Upbit');
    if (!data || data.length === 0 || !data[0].orderbook_units || data[0].orderbook_units.length === 0) throw new Error('Pair not found on Upbit');
    const orderbook = data[0].orderbook_units[0];
    return { askPrice: orderbook.ask_price, bidPrice: orderbook.bid_price };
}

async function handleBinance(symbol) {
    const data = await handleRequest(`https://api.binance.com/api/v3/ticker/bookTicker?symbol=${symbol}`, 'Binance');
    return { askPrice: data.askPrice, bidPrice: data.bidPrice };
}

// --- მთავარი პროქსის ლოგიკა ---
const exchangeHandlers = {
    'binance': handleBinance, 'kraken': handleKraken, 'okx': handleOkx, 'bybit': handleBybit, // Bybit არ იყო დამატებული, დავამატებ ახლა
    'kucoin': handleKucoin, 'bitmart': handleBitmart, 'gate.io': handleGateio, 'mexc': handleMexc,
    'bitget': handleBitget, 'xt.com': handleXt, 'hitbtc': handleHitbtc, 'ascendex': handleAscendex,
    'whitebit': handleWhitebit, 'upbit': handleUpbit, 'bitrue': handleBitrue, 'huobi (htx)': handleHuobi
};
// Bybit იყენებს იგივე ენდფოინთს, როგორც Binance, ამიტომ პირდაპირ ვამატებთ
async function handleBybit(symbol) {
    const data = await handleRequest(`https://api.bybit.com/v5/market/tickers?category=spot&symbol=${symbol}`, 'Bybit');
    if (data.retCode !== 0 || !data.result.list || data.result.list.length === 0) throw new Error('Pair not found on Bybit');
    return { askPrice: data.result.list[0].ask1Price, bidPrice: data.result.list[0].bid1Price };
}


export default async function handler(request, response) {
    const { exchange, symbol } = request.query;

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') { return response.status(200).end(); }
    if (!exchange || !symbol) { return response.status(400).json({ error: 'Exchange and symbol parameters are required' }); }

    const handlerFunction = exchangeHandlers[exchange.toLowerCase()];

    if (!handlerFunction) { return response.status(400).json({ error: `Unsupported exchange: ${exchange}` }); }

    try {
        const data = await handlerFunction(symbol);
        response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        return response.status(200).json(data);
    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
}
