// /api/huobi.js - საბოლოო ვერსია ეფექტური v1 მისამართით

export default async function handler(request, response) {
  // ვიღებთ სიმბოლოს, მაგ: btcusdt
  const { symbol } = request.query;

  if (!symbol) {
    return response.status(400).json({ error: 'Symbol parameter is required' });
  }

  // ⭐ ვიყენებთ ახალ, ეფექტურ API მისამართს, რომელიც მხოლოდ ერთ წყვილს აბრუნებს
  const apiUrl = `https://api.huobi.pro/market/detail/merged?symbol=${symbol}`;

  try {
    const apiResponse = await fetch(apiUrl);
    if (!apiResponse.ok) {
      throw new Error(`Huobi API responded with status: ${apiResponse.status}`);
    }
    const data = await apiResponse.json();

    if (data.status !== 'ok' || !data.tick) {
      throw new Error(`Pair ${symbol} not found on Huobi or API error`);
    }

    const ticker = data.tick;

    // ვქმნით სტანდარტულ ობიექტს
    const formattedData = {
      askPrice: ticker.ask[0], // Ask price არის მასივის პირველი ელემენტი
      bidPrice: ticker.bid[0], // Bid price არის მასივის პირველი ელემენტი
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
