// /api/proxy.js - ერთიანი პროქსი ყველა ბირჟისთვის

// --- დამხმარე ფუნქციები თითოეული ბირჟისთვის ---

async function handleOkx(symbol) {
    const apiUrl = `https://www.okx.com/api/v5/market/tickers?instType=SPOT`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`OKX API responded with status: ${response.status}`);
    const data = await response.json();
    if (data.code !== '0' || !data.data || data.data.length === 0) throw new Error('OKX API did not return valid data');
    const ticker = data.data.find(t => t.instId === symbol);
    if (!ticker) throw new Error(`Pair ${symbol} not found in OKX response`);
    return { askPrice: ticker.askPx, bidPrice: ticker.bidPx };
}

async function handleKraken(symbol) {
    const apiUrl = `https://api.kraken.com/0/public/Ticker?pair=${symbol}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Kraken API responded with status: ${response.status}`);
    const data = await response.json();
    if (data.error && data.error.length > 0) throw new Error(data.error.join(', '));
    const resultPair = data.result[symbol];
    if (!resultPair) throw new Error('Pair not found on Kraken');
    return { askPrice: resultPair.a[0], bidPrice: resultPair.b[0] };
}

async function handleWhitebit(symbol) {
    const apiUrl = `https://whitebit.com/api/v4/public/ticker`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`WhiteBIT API responded with status: ${response.status}`);
    const allTickers = await response.json();
    const specificTicker = allTickers[symbol];
    if (!specificTicker) throw new Error(`Pair ${symbol} not found on WhiteBIT`);
    return { askPrice: specificTicker.ask, bidPrice: specificTicker.bid };
}

async function handleHuobi(symbol) {
    const apiUrl = `https://api.huobi.pro/market/detail/merged?symbol=${symbol}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Huobi API responded with status: ${response.status}`);
    const data = await response.json();
    if (data.status !== 'ok' || !data.tick) throw new Error(`Pair ${symbol} not found on Huobi`);
    const ticker = data.tick;
    return { askPrice: ticker.ask[0], bidPrice: ticker.bid[0] };
}

async function handleKucoin(symbol) {
    const apiUrl = `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${symbol}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`KuCoin API responded with status: ${response.status}`);
    const data = await response.json();
    if (data.code !== '200000' || !data.data) throw new Error(data.msg || 'Pair not found on KuCoin');
    return { askPrice: data.data.bestAsk, bidPrice: data.data.bestBid };
}

async function handleBitmart(symbol) {
    const apiUrl = `https://api-cloud.bitmart.com/spot/v1/ticker?symbol=${symbol}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`BitMart API responded with status: ${response.status}`);
    const data = await response.json();
    if (data.code !== 1000 || !data.data.tickers || data.data.tickers.length === 0) throw new Error('Pair not found on BitMart');
    const ticker = data.data.tickers[0];
    return { askPrice: ticker.best_ask, bidPrice: ticker.best_bid };
}

async function handleGateio(symbol) {
    const apiUrl = `https://api.gateio.ws/api/v4/spot/tickers?currency_pair=${symbol}`;
    const response = await fetch(apiUrl);
    if (!response.ok || (Array.isArray(data) && data.length === 0) || data.label) throw new Error('Pair not found on Gate.io');
    const data = await response.json();
    return { askPrice: data[0].lowest_ask, bidPrice: data[0].highest_bid };
}

async function handleMexc(symbol) {
    const apiUrl = `https://api.mexc.com/api/v3/ticker/bookTicker?symbol=${symbol}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Pair not found on MEXC');
    const data = await response.json();
    return { askPrice: data.askPrice, bidPrice: data.bidPrice };
}

async function handleBitget(symbol) {
    const apiUrl = `https://api.bitget.com/api/v2/spot/market/tickers?symbol=${symbol}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.code !== "00000" || !data.data || data.data.length === 0) throw new Error(`Pair not found on Bitget`);
    return { askPrice: data.data[0].askPr, bidPrice: data.data[0].bidPr };
}

async function handleXt(symbol) {
    const apiUrl = `https://sapi.xt.com/v4/public/ticker?symbol=${symbol}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`XT.com API responded with status: ${response.status}`);
    const data = await response.json();
    if (data.rc !== 0 || !data.result || data.result.length === 0) throw new Error('Pair not found on XT.com');
    const ticker = data.result[0];
    return { askPrice: ticker.ap, bidPrice: ticker.bp };
}

async function handleHitbtc(symbol) {
    const apiUrl = `https://api.hitbtc.com/api/3/public/ticker/${symbol}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HitBTC API responded with status: ${response.status}`);
    const data = await response.json();
    return { askPrice: data.ask, bidPrice: data.bid };
}

async function handleAscendex(symbol) {
    const apiUrl = `https://ascendex.com/api/pro/v1/spot/ticker?symbol=${symbol}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`AscendEX API responded with status: ${response.status}`);
    const data = await response.json();
    if (data.code !== 0 || !data.data) throw new Error('Pair not found on AscendEX');
    return { askPrice: data.data.ask[0], bidPrice: data.data.bid[0] };
}

async function handleBitrue(symbol) {
    const apiUrl = `https://openapi.bitrue.com/api/v2/ticker/bookTicker?symbol=${symbol}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Bitrue API responded with status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    if (!data || !data.symbol) throw new Error('Pair not found on Bitrue');
    return { askPrice: data.askPrice, bidPrice: data.bidPrice };
}

// --- მთავარი პროქსის ლოგიკა ---

const exchangeHandlers = {
    okx: handleOkx,
    kraken: handleKraken,
    whitebit: handleWhitebit,
    huobi: handleHuobi,
    kucoin: handleKucoin,
    bitmart: handleBitmart,
    'gate.io': handleGateio,
    mexc: handleMexc,
    bitget: handleBitget,
    'xt.com': handleXt,
    hitbtc: handleHitbtc,
    ascendex: handleAscendex,
    bitrue: handleBitrue
};

export default async function handler(request, response) {
    const { exchange, symbol } = request.query;

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }
    
    if (!exchange || !symbol) {
        return response.status(400).json({ error: 'Exchange and symbol parameters are required' });
    }

    const handlerFunction = exchangeHandlers[exchange.toLowerCase()];

    if (!handlerFunction) {
        return response.status(400).json({ error: `Unsupported exchange: ${exchange}` });
    }

    try {
        const data = await handlerFunction(symbol);
        response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        return response.status(200).json(data);
    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
}
