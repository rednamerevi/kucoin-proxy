// ეს არის Vercel-ის სერვერული ფუნქცია CoinCatch-ისთვის (შესწორებული ვერსია)
export default async function handler(request, response) {
  // CORS-ის თავსართები
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // ვიღებთ სიმბოლოს, მაგ: ?symbol=BTC-USDT
  const { symbol } = request.query;

  if (!symbol) {
    return response.status(400).json({ error: 'Symbol parameter is required' });
  }

  // ⭐ შესწორებული API მისამართი და სიმბოლოს ფორმატი ⭐
  const apiUrl = `https://api.coincatch.com/api/v1/market/ticker/24hr?symbol=${symbol}`;

  try {
    const apiResponse = await fetch(apiUrl);
    if (!apiResponse.ok) {
      throw new Error(`CoinCatch API-მ დააბრუნა სტატუსი: ${apiResponse.status}`);
    }
    
    const data = await apiResponse.json();
    if (data.code !== 200 || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('CoinCatch-ზე მონაცემები ვერ მოიძებნა ან არასწორი პასუხია.');
    }
    
    response.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
    return response.status(200).json(data.data[0]);

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
