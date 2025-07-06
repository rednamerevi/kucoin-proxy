// /api/okx.js - საბოლოო და სწორი ვერსია

export default async function handler(request, response) {
  // ვიღებთ სიმბოლოს, მაგ: ETH-USDT
  const { symbol } = request.query;

  if (!symbol) {
    return response.status(400).json({ error: 'Symbol parameter is required' });
  }

  // OKX-ის API მისამართი
  const apiUrl = `https://www.okx.com/api/v5/market/tickers?instType=SPOT&instId=${symbol}`;

  try {
    const apiResponse = await fetch(apiUrl);
    if (!apiResponse.ok) {
      throw new Error(`OKX API responded with status: ${apiResponse.status}`);
    }
    const data = await apiResponse.json();

    if (data.code !== '0' || !data.data || data.data.length === 0) {
      throw new Error('Pair not found on OKX or API error');
    }

    const ticker = data.data[0];

    const formattedData = {
      askPrice: ticker.askPx,
      bidPrice: ticker.bidPx,
      price: ticker.last
    };

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return response.status(200).json(formattedData);

  } catch (error) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    return response.status(500).json({ error: error.message });
  }
}
