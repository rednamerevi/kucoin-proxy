// /api/proxy.js - ერთიანი პროქსი ყველა ბირჟისთვის (სრული, შესწორებული ვერსია)

// --- დამხმარე ფუნქციები ---

async function handleRequest(apiUrl, exchangeName) {
    const response = await fetch(apiUrl);
    if (!response.ok) {
        let errorBody = 'No error body';
        try {
            errorBody = await response.json();
        } catch (e) { /* Ignore parsing error */ }
        throw new Error(`${exchangeName} API responded with status: ${response.status} ${response.statusText}. Body: ${JSON.stringify(errorBody)}`);
    }
    return response.json();
}

// --- ბირჟების ფუნქციები (შესწორებულია რაოდენობის დასამატებლად) ---

async function handleOkx(symbol) {
    const data = await handleRequest(`https://www.okx.com/api/v5/market/books?instId=${symbol}&sz=1`, 'OKX');
    if (data.code !== '0' || !data.data || !data.data[0]) throw new Error('OKX API error or pair not found');
    const book = data.data[0];
    return { askPrice: book.asks[0][0], bidPrice: book.bids[0][0], askVolume: book.asks[0][1], bidVolume: book.bids[0][1] };
}

async function handleKraken(symbol) {
    const data = await handleRequest(`https://api.kraken.com/0/public/Ticker?pair=${symbol}`, 'Kraken');
    if (data.error && data.error.length > 0) throw new Error(data.error.join(', '));
    const pairKey = Object.keys(data.result)[0];
    const resultPair = data.result[pairKey];
    if (!resultPair) throw new Error('Pair not found on Kraken');
    return { askPrice: resultPair.a[0], bidPrice: resultPair.b[0], askVolume: resultPair.a[1], bidVolume: resultPair.b[1] };
}

async function handleWhitebit(symbol) {
    const data = await handleRequest(`https://whitebit.com/api/v4/public/orderbook/${symbol}?limit=1`, 'WhiteBIT');
    if (!data || !data.asks || data.asks.length === 0) throw new Error(`Pair ${symbol} not found on WhiteBIT`);
    return { askPrice: data.asks[0][0], bidPrice: data.bids[0][0], askVolume: data.asks[0][1], bidVolume: data.bids[0][1] };
}

async function handleHuobi(symbol) {
    const data = await handleRequest(`https://api.huobi.pro/market/detail/merged?symbol=${symbol}`, 'Huobi (HTX)');
    if (data.status !== 'ok' || !data.tick) throw new Error(`Pair ${symbol} not found on Huobi`);
    return { askPrice: data.tick.ask[0], bidPrice: data.tick.bid[0], askVolume: data.tick.ask[1], bidVolume: data.tick.bid[1] };
}

async function handleKucoin(symbol) {
    const data = await handleRequest(`https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${symbol}`, 'KuCoin');
    if (data.code !== '200000' || !data.data) throw new Error(data.msg || 'Pair not found on KuCoin');
    return { askPrice: data.data.bestAsk, bidPrice: data.data.bestBid, askVolume: data.data.bestAskSize, bidVolume: data.data.bestBidSize };
}

async function handleBitmart(symbol) {
    const data = await handleRequest(`https://api-cloud.bitmart.com/spot/v1/ticker?symbol=${symbol}`, 'BitMart');
    if (data.code !== 1000 || !data.data.tickers || data.data.tickers.length === 0) throw new Error('Pair not found on BitMart');
    const ticker = data.data.tickers[0];
    return { askPrice: ticker.best_ask, bidPrice: ticker.best_bid, askVolume: ticker.best_ask_size, bidVolume: ticker.best_bid_size };
}

async function handleGateio(symbol) {
    const data = await handleRequest(`https://api.gateio.ws/api/v4/spot/order_book?currency_pair=${symbol}&limit=1`, 'Gate.io');
    if (!data || !data.asks || data.asks.length === 0) throw new Error('Pair not found on Gate.io');
    return { askPrice: data.asks[0][0], bidPrice: data.bids[0][0], askVolume: data.asks[0][1], bidVolume: data.bids[0][1] };
}

async function handleMexc(symbol) {
    const data = await handleRequest(`https://api.mexc.com/api/v3/ticker/bookTicker?symbol=${symbol}`, 'MEXC');
    return { askPrice: data.askPrice, bidPrice: data.bidPrice, askVolume: data.askQty, bidVolume: data.bidQty };
}

async function handleBitget(symbol) {
    const data = await handleRequest(`https://api.bitget.com/api/v2/spot/market/tickers?symbol=${symbol}`, 'Bitget');
    if (data.code !== "00000" || !data.data || data.data.length === 0) throw new Error(`Pair not found on Bitget`);
    return { askPrice: data.data[0].askPr, bidPrice: data.data[0].bidPr, askVolume: data.data[0].askSz, bidVolume: data.data[0].bidSz };
}

async function handleXt(symbol) {
    const data = await handleRequest(`https://sapi.xt.com/v4/public/depth?symbol=${symbol}&limit=1`, 'XT.com');
    if (data.rc !== 0 || !data.result) throw new Error('Pair not found on XT.com');
    return { askPrice: data.result.a[0][0], bidPrice: data.result.b[0][0], askVolume: data.result.a[0][1], bidVolume: data.result.b[0][1] };
}

async function handleHitbtc(symbol) {
    const data = await handleRequest(`https://api.hitbtc.com/api/3/public/orderbook/${symbol}?limit=1`, 'HitBTC');
    if (!data.ask || !data.ask[0]) throw new Error(`Pair not found on HitBTC`);
    return { askPrice: data.ask[0].price, bidPrice: data.bid[0].price, askVolume: data.ask[0].size, bidVolume: data.bid[0].size };
}

async function handleAscendex(symbol) {
    const data = await handleRequest(`https://ascendex.com/api/pro/v1/spot/ticker?symbol=${symbol}`, 'AscendEX');
    if (data.code !== 0 || !data.data) throw new Error('Pair not found on AscendEX');
    return { askPrice: data.data.ask[0], bidPrice: data.data.bid[0], askVolume: data.data.ask[1], bidVolume: data.data.bid[1] };
}

async function handleBitrue(symbol) {
    const data = await handleRequest(`https://openapi.bitrue.com/api/v1/ticker/bookTicker?symbol=${symbol}`, 'Bitrue');
    if (!data || !data.symbol) throw new Error('Pair not found on Bitrue');
    return { askPrice: data.askPrice, bidPrice: data.bidPrice, askVolume: data.askQty, bidVolume: data.bidQty };
}

async function handleUpbit(symbol) {
    const data = await handleRequest(`https://api.upbit.com/v1/orderbook?markets=${symbol}`, 'Upbit');
    if (!data || data.length === 0 || !data[0].orderbook_units || data[0].orderbook_units.length === 0) throw new Error('Pair not found on Upbit');
    const orderbook = data[0].orderbook_units[0];
    return { askPrice: orderbook.ask_price, bidPrice: orderbook.bid_price, askVolume: orderbook.ask_size, bidVolume: orderbook.bid_size };
}

async function handleBinance(symbol) {
    const data = await handleRequest(`https://api.binance.com/api/v3/ticker/bookTicker?symbol=${symbol}`, 'Binance');
    return { askPrice: data.askPrice, bidPrice: data.bidPrice, askVolume: data.askQty, bidVolume: data.bidQty };
}

async function handleBybit(symbol) {
    const data = await handleRequest(`https://api.bybit.com/v5/market/tickers?category=spot&symbol=${symbol}`, 'Bybit');
    if (data.retCode !== 0 || !data.result.list || data.result.list.length === 0) throw new Error('Pair not found on Bybit');
    const ticker = data.result.list[0];
    return { askPrice: ticker.ask1Price, bidPrice: ticker.bid1Price, askVolume: ticker.ask1Size, bidVolume: ticker.bid1Size };
}

// --- მთავარი პროქსის ლოგიკა ---
const exchangeHandlers = {
    'binance': handleBinance, 'kraken': handleKraken, 'okx': handleOkx, 'bybit': handleBybit,
    'kucoin': handleKucoin, 'bitmart': handleBitmart, 'gate.io': handleGateio, 'mexc': handleMexc,
    'bitget': handleBitget, 'xt.com': handleXt, 'hitbtc': handleHitbtc, 'ascendex': handleAscendex,
    'whitebit': handleWhitebit, 'upbit': handleUpbit, 'bitrue': handleBitrue, 'huobi (htx)': handleHuobi
};

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
        const data = await handlerFunction(symbol.toUpperCase()); // Ensure symbol is uppercase for consistency
        response.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=30'); // Cache for 30s
        return response.status(200).json(data);
    } catch (error) {
        console.error(`Error for ${exchange} with symbol ${symbol}:`, error.message);
        return response.status(500).json({ error: error.message });
    }
}
