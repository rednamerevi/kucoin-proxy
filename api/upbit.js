// /api/upbit.js

export default async function handler(request, response) {
  // ვიღებთ სიმბოლოს, მაგ: USDT-BTC
  const { symbol } = request.query;

  if (!symbol) {
    return response.status(400).json({ error: 'Symbol parameter is required' });
  }

  // Upbit-ის orderbook ენდფოინთი
  const apiUrl = `https://api.upbit.com/v1/orderbook?markets=${symbol}`;

  try {
    const apiResponse = await fetch(apiUrl);
    if (!apiResponse.ok) {
      throw new Error(`Upbit API responded with status: ${apiResponse.status}`);
    }
    const data = await apiResponse.json();

    if (!data || data.length === 0 || !data[0].orderbook_units || data[0].orderbook_units.length === 0) {
      throw new Error('Pair not found on Upbit or invalid response');
    }

    const orderbook = data[0].orderbook_units[0];

    const formattedData = {
      askPrice: orderbook.ask_price,
      bidPrice: orderbook.bid_price
    };

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return response.status(200).json(formattedData);

  } catch (error) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    return response.status(500).json({ error: error.message });
  }
}
