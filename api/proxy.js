// /api/proxy.js - თქვენი სრული კოდი DEX-ის დამატებით

async function handleRequest(apiUrl, exchangeName) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
        const response = await fetch(apiUrl, { signal: controller.signal });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`${exchangeName} API responded with status: ${response.status}. Body: ${errorBody}`);
        }
        return response.json();
    } finally {
        clearTimeout(timeoutId);
    }
}

// --- ცვლილება #1: ფუნქციის პარამეტრი შეიცვალა ---
async function getTickerData(exchange, params) { // `rawSymbol` შეიცვალა `params`-ით
    const handlers = {
        binance: async (p) => { // ყველა `s` შეიცვალა `p.symbol`-ით
            const data = await handleRequest(`https://api.binance.com/api/v3/ticker/bookTicker?symbol=${p.symbol}`, 'Binance');
            return { askPrice: data.askPrice, bidPrice: data.bidPrice, askVolume: data.askQty, bidVolume: data.bidQty };
        },
        bybit: async (p) => {
            const data = await handleRequest(`https://api.bybit.com/v5/market/tickers?category=spot&symbol=${p.symbol}`, 'Bybit');
            if (data.retCode !== 0 || !data.result.list || data.result.list.length === 0) throw new Error('Pair not found on Bybit');
            const ticker = data.result.list[0];
            return { askPrice: ticker.ask1Price, bidPrice: ticker.bid1Price, askVolume: ticker.ask1Size, bidVolume: ticker.bid1Size };
        },
        kraken: async (p) => {
            const data = await handleRequest(`https://api.kraken.com/0/public/Ticker?pair=${p.symbol}`, 'Kraken');
            if (data.error && data.error.length > 0) throw new Error(data.error.join(', '));
            const pairKey = Object.keys(data.result)[0];
            const resultPair = data.result[pairKey];
            return { askPrice: resultPair.a[0], bidPrice: resultPair.b[0], askVolume: resultPair.a[1], bidVolume: resultPair.b[1] };
        },
        okx: async (p) => {
            const data = await handleRequest(`https://www.okx.com/api/v5/market/books?instId=${p.symbol}&sz=1`, 'OKX');
            if (data.code !== '0' || !data.data || !data.data[0] || !data.data[0].asks[0]) throw new Error('Pair not found on OKX');
            const book = data.data[0];
            return { askPrice: book.asks[0][0], bidPrice: book.bids[0][0], askVolume: book.asks[0][1], bidVolume: book.bids[0][1] };
        },
        kucoin: async (p) => {
            const data = await handleRequest(`https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${p.symbol}`, 'KuCoin');
            if (data.code !== '200000' || !data.data) throw new Error(data.msg || 'Pair not found on KuCoin');
            return { askPrice: data.data.bestAsk, bidPrice: data.data.bestBid, askVolume: data.data.bestAskSize, bidVolume: data.data.bestBidSize };
        },
        bitmart: async (p) => {
            const data = await handleRequest(`https://api-cloud.bitmart.com/spot/v1/ticker?symbol=${p.symbol}`, 'BitMart');
            if (data.code !== 1000 || !data.data.tickers || data.data.tickers.length === 0) throw new Error('Pair not found on BitMart');
            const ticker = data.data.tickers[0];
            return { askPrice: ticker.best_ask, bidPrice: ticker.best_bid, askVolume: ticker.best_ask_size, bidVolume: ticker.best_bid_size };
        },
        'gate.io': async (p) => {
            const data = await handleRequest(`https://api.gateio.ws/api/v4/spot/order_book?currency_pair=${p.symbol}&limit=1`, 'Gate.io');
            if (!data || !data.asks || data.asks.length === 0) throw new Error('Pair not found on Gate.io');
            return { askPrice: data.asks[0][0], bidPrice: data.bids[0][0], askVolume: data.asks[0][1], bidVolume: data.bids[0][1] };
        },
        mexc: async (p) => {
            const data = await handleRequest(`https://api.mexc.com/api/v3/ticker/bookTicker?symbol=${p.symbol}`, 'MEXC');
            return { askPrice: data.askPrice, bidPrice: data.bidPrice, askVolume: data.askQty, bidVolume: data.bidQty };
        },
        bitget: async (p) => {
            const data = await handleRequest(`https://api.bitget.com/api/v2/spot/market/tickers?symbol=${p.symbol}`, 'Bitget');
            if (data.code !== "00000" || !data.data || data.data.length === 0) throw new Error(`Pair not found on Bitget`);
            return { askPrice: data.data[0].askPr, bidPrice: data.data[0].bidPr, askVolume: data.data[0].askSz, bidVolume: data.data[0].bidSz };
        },
        whitebit: async (p) => {
            const data = await handleRequest(`https://whitebit.com/api/v4/public/orderbook/${p.symbol}?limit=1`, 'WhiteBIT');
            if (!data || !data.asks || data.asks.length === 0) throw new Error(`Pair ${p.symbol} not found on WhiteBIT`);
            return { askPrice: data.asks[0][0], bidPrice: data.bids[0][0], askVolume: data.asks[0][1], bidVolume: data.bids[0][1] };
        },
        upbit: async (p) => {
            const data = await handleRequest(`https://api.upbit.com/v1/orderbook?markets=${p.symbol}`, 'Upbit');
            if (!data || data.length === 0 || !data[0].orderbook_units || data[0].orderbook_units.length === 0) throw new Error('Pair not found on Upbit');
            const orderbook = data[0].orderbook_units[0];
            return { askPrice: orderbook.ask_price, bidPrice: orderbook.bid_price, askVolume: orderbook.ask_size, bidVolume: orderbook.bid_size };
        },
        bitrue: async (p) => {
            const data = await handleRequest(`https://openapi.bitrue.com/api/v1/ticker/bookTicker?symbol=${p.symbol}`, 'Bitrue');
            if (!data || !data.symbol) throw new Error('Pair not found on Bitrue');
            return { askPrice: data.askPrice, bidPrice: data.bidPrice, askVolume: data.askQty, bidVolume: data.bidQty };
        },
        huobi: async (p) => {
            const data = await handleRequest(`https://api.huobi.pro/market/detail/merged?symbol=${p.symbol}`, 'Huobi (HTX)');
            if (data.status !== 'ok' || !data.tick) throw new Error(`Pair ${p.symbol} not found on Huobi`);
            return { askPrice: data.tick.ask[0], bidPrice: data.tick.bid[0], askVolume: data.tick.ask[1], bidVolume: data.tick.bid[1] };
        },
        'xt.com': async (p) => {
            const data = await handleRequest(`https://sapi.xt.com/v4/public/depth?symbol=${p.symbol}&limit=1`, 'XT.com');
            if (data.rc !== 0 || !data.result || !data.result.a || data.result.a.length === 0) throw new Error('Pair not found on XT.com');
            return { askPrice: data.result.a[0][0], bidPrice: data.result.b[0][0], askVolume: data.result.a[0][1], bidVolume: data.result.b[0][1] };
        },
        hitbtc: async (p) => {
            const data = await handleRequest(`https://api.hitbtc.com/api/3/public/orderbook/${p.symbol}?limit=1`, 'HitBTC');
            if (!data.ask || !data.ask[0]) throw new Error(`Pair not found on HitBTC`);
            return { askPrice: data.ask[0].price, bidPrice: data.bid[0].price, askVolume: data.ask[0].size, bidVolume: data.bid[0].size };
        },
        ascendex: async (p) => {
            const data = await handleRequest(`https://ascendex.com/api/pro/v1/spot/ticker?symbol=${p.symbol}`, 'AscendEX');
            if (data.code !== 0 || !data.data) throw new Error('Pair not found on AscendEX');
            return { askPrice: data.data.ask[0], bidPrice: data.data.bid[0], askVolume: data.data.ask[1], bidVolume: data.data.bid[1] };
        },

        // --- დამატებული კოდი იწყება ---
        dex: async (p) => {
            // p (params) იქნება ობიექტი { network, contract }
            if (!p.network || !p.contract) {
                throw new Error('Network and contract address are required for DEX query.');
            }
            const apiUrl = `https://api.geckoterminal.com/api/v2/networks/${p.network}/pools/${p.contract}`;
            const data = await handleRequest(apiUrl, `DEX (${p.network})`);
            
            if (!data || !data.data || !data.data.attributes) {
                throw new Error('Pool not found on GeckoTerminal');
            }
            
            const attributes = data.data.attributes;
            const price = parseFloat(attributes.base_token_price_usd);
            
            return {
                askPrice: price,
                bidPrice: price, 
                askVolume: parseFloat(attributes.reserve_in_usd) / 2,
                bidVolume: parseFloat(attributes.reserve_in_usd) / 2,
                dexName: data.data.relationships.dex.data.id
            };
        }
        // --- დამატებული კოდი მთავრდება ---
    };

    const handlerFunction = handlers[exchange.toLowerCase()];
    if (!handlerFunction) {
        throw new Error(`Unsupported exchange handler: ${exchange}`);
    }
    
    // ძველი კოდი იღებდა `rawSymbol`-ს. ახლა გადავცემთ მთლიან პარამეტრებს.
    // CEX-ებისთვის params იქნება { symbol }, DEX-ისთვის { network, contract }
    return handlerFunction(params);
}

// --- ცვლილება #2: მთავარი handler-ის ლოგიკა განახლდა ---
export default async function handler(request, response) {
    // ვიღებთ ყველა შესაძლო პარამეტრს
    const { exchange, symbol, network, contract } = request.query;

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }
    
    if (!exchange) {
        return response.status(200).json({ error: true, message: 'Exchange parameter is required' });
    }

    try {
        let params;
        // ვადგენთ რა პარამეტრები გადავცეთ handler-ს იმის მიხედვით, CEX-ია თუ DEX
        if (exchange.toLowerCase() === 'dex') {
            if (!network || !contract) {
                 return response.status(200).json({ error: true, message: 'Network and Contract parameters are required for DEX' });
            }
            params = { network, contract };
        } else {
            if (!symbol) {
                return response.status(200).json({ error: true, message: 'Symbol parameter is required for CEX' });
            }
            // CEX-ების handler-ები ელიან `symbol` property-ს `params` ობიექტში
            params = { symbol };
        }
        
        const data = await getTickerData(exchange, params);

        response.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=30');
        return response.status(200).json(data);
    } catch (error) {
        console.error(`Error for ${exchange} with params ${JSON.stringify(request.query)}:`, error.message);
        return response.status(200).json({ 
            error: true,
            message: error.message 
        });
    }
}
