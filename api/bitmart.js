// /api/bitmart.js

export default async function handler(request, response) {
  // ვიღებთ სიმბოლოს, მაგ: BTC_USDT
  const { symbol } = request.query;

  if (!symbol) {
    return response.status(400).json({ error: 'Symbol parameter is required' });
  }

  // BitMart-ის API მისამართი
  const apiUrl = `https://api-cloud.bitmart.com/spot/v1/ticker?symbol=${symbol}`;

  try {
    const apiResponse = await fetch(apiUrl);
    if (!apiResponse.ok) {
      throw new Error(`BitMart API responded with status: ${apiResponse.status}`);
    }
    const data = await apiResponse.json();

    if (data.code !== 1000 || !data.data.tickers || data.data.tickers.length === 0) {
      throw new Error('Pair not found on BitMart or API error');
    }

    const ticker = data.data.tickers[0];

    // ვქმნით სტანდარტულ ობიექტს ჩვენი აპლიკაციისთვის
    const formattedData = {
      askPrice: ticker.best_ask,
      bidPrice: ticker.best_bid,
      price: ticker.last_price
    };

    // ვაბრუნებთ პასუხს CORS ჰედერით
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return response.status(200).json(formattedData);

  } catch (error) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    return response.status(500).json({ error: error.message });
  }
}
