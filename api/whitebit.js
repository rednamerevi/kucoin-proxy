// /api/whitebit.js - საბოლოო და სწორი ვერსია

export default async function handler(request, response) {
  // ვიღებთ სიმბოლოს, რომელსაც ფრონტენდი გვაწვდის (მაგ: BTC_USDT)
  const { symbol } = request.query;

  if (!symbol) {
    return response.status(400).json({ error: 'Symbol parameter is required' });
  }

  const apiUrl = `https://whitebit.com/api/v4/public/ticker`;

  try {
    const apiResponse = await fetch(apiUrl);
    if (!apiResponse.ok) {
      throw new Error(`WhiteBIT API responded with status: ${apiResponse.status}`);
    }
    const allTickers = await apiResponse.json();

    // ვეძებთ ჩვენთვის სასურველ წყვილს დაბრუნებულ დიდ ობიექტში
    const specificTicker = allTickers[symbol];

    if (!specificTicker) {
      throw new Error(`Pair ${symbol} not found on WhiteBIT`);
    }

    // ვქმნით სტანდარტულ ობიექტს
    const formattedData = {
      askPrice: specificTicker.ask,
      bidPrice: specificTicker.bid,
      price: specificTicker.last_price
    };

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return response.status(200).json(formattedData);

  } catch (error) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    return response.status(500).json({ error: error.message });
  }
}
