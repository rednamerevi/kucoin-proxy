// /api/kraken.js

export default async function handler(request, response) {
  // ვიღებთ სიმბოლოს, მაგ: ETHUSDT
  const { symbol } = request.query;

  if (!symbol) {
    return response.status(400).json({ error: 'Symbol parameter is required' });
  }

  // Kraken-ის API მისამართი
  const apiUrl = `https://api.kraken.com/0/public/Ticker?pair=${symbol}`;

  try {
    const apiResponse = await fetch(apiUrl);
    if (!apiResponse.ok) {
      throw new Error(`Kraken API responded with status: ${apiResponse.status}`);
    }
    const data = await apiResponse.json();

    if (data.error && data.error.length > 0) {
      throw new Error(data.error.join(', '));
    }

    // Kraken-ის პასუხის სტრუქტურა განსხვავებულია
    const resultPair = data.result[symbol];
    if (!resultPair) {
      throw new Error('Pair not found on Kraken');
    }

    const formattedData = {
      askPrice: resultPair.a[0], // Ask price
      bidPrice: resultPair.b[0], // Bid price
      price: resultPair.c[0]     // Last trade price
    };

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return response.status(200).json(formattedData);

  } catch (error) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    return response.status(500).json({ error: error.message });
  }
}
