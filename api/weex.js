// /api/weex.js

export default async function handler(request, response) {
  // ვიღებთ სიმბოლოს, მაგ: BTCUSDT
  const { symbol } = request.query;

  if (!symbol) {
    return response.status(400).json({ error: 'Symbol parameter is required' });
  }

  // WEEX-ის API მისამართი
  const apiUrl = `https://api.weex.com/api/v1/spot/public/ticker?symbol=${symbol}`;

  try {
    const apiResponse = await fetch(apiUrl);
    if (!apiResponse.ok) {
      throw new Error(`WEEX API responded with status: ${apiResponse.status}`);
    }
    const data = await apiResponse.json();

    if (data.code !== '0' || !data.data || data.data.length === 0) {
      throw new Error('Pair not found on WEEX or API error');
    }

    const ticker = data.data[0];

    // ვქმნით სტანდარტულ ობიექტს ჩვენი აპლიკაციისთვის
    const formattedData = {
      askPrice: ticker.askPr,
      bidPrice: ticker.bidPr,
      price: ticker.lastPr
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
