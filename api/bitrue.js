// /api/bitrue.js

export default async function handler(request, response) {
  // ვიღებთ სიმბოლოს, მაგ: BTCUSDT
  const { symbol } = request.query;

  if (!symbol) {
    return response.status(400).json({ error: 'Symbol parameter is required' });
  }

  // Bitrue-ს API მისამართი
  const apiUrl = `https://openapi.bitrue.com/api/v1/ticker/24hr?symbol=${symbol}`;

  try {
    const apiResponse = await fetch(apiUrl);
    if (!apiResponse.ok) {
      // Bitrue-ს API შეცდომისას არ აბრუნებს JSON-ს, ამიტომ ვიჭერთ სტატუსს
      throw new Error(`Bitrue API responded with status: ${apiResponse.status} ${apiResponse.statusText}`);
    }
    const data = await apiResponse.json();

    // Bitrue-ს პასუხი არის ობიექტი და არა მასივი, ამიტომ პირდაპირ ვიყენებთ
    if (!data || !data.symbol) {
      throw new Error('Pair not found on Bitrue or API error');
    }

    // ვქმნით სტანდარტულ ობიექტს
    const formattedData = {
      askPrice: data.askPrice,
      bidPrice: data.bidPrice,
      price: data.lastPrice
    };

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return response.status(200).json(formattedData);

  } catch (error) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    return response.status(500).json({ error: error.message });
  }
}
