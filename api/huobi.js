// /api/huobi.js

export default async function handler(request, response) {
  // ვიღებთ სიმბოლოს, მაგ: btcusdt
  const { symbol } = request.query;

  if (!symbol) {
    return response.status(400).json({ error: 'Symbol parameter is required' });
  }

  // Huobi-ს API ყველა წყვილს ერთად აბრუნებს
  const apiUrl = `https://api.huobi.pro/market/tickers`;

  try {
    const apiResponse = await fetch(apiUrl);
    if (!apiResponse.ok) {
      throw new Error(`Huobi API responded with status: ${apiResponse.status}`);
    }
    const data = await apiResponse.json();

    if (data.status !== 'ok' || !data.data || data.data.length === 0) {
      throw new Error('Huobi API did not return valid data');
    }

    // ვეძებთ ჩვენს სიმბოლოს დაბრუნებულ დიდ სიაში
    const ticker = data.data.find(t => t.symbol === symbol);

    if (!ticker) {
      throw new Error(`Pair ${symbol} not found on Huobi`);
    }

    // ვქმნით სტანდარტულ ობიექტს
    const formattedData = {
      askPrice: ticker.ask,
      bidPrice: ticker.bid,
      price: ticker.close
    };

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return response.status(200).json(formattedData);

  } catch (error) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    return response.status(500).json({ error: error.message });
  }
}
