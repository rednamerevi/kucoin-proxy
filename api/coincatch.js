// ეს არის Vercel-ის სერვერული ფუნქცია CoinCatch-ისთვის
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

  // CoinCatch-ის API-ს მისამართი
  const apiUrl = `https://api.coincatch.com/api/v1/ticker/24hr?symbol=${symbol}`;

  try {
    const apiResponse = await fetch(apiUrl);
    if (!apiResponse.ok) {
      throw new Error(`CoinCatch API-მ დააბრუნა სტატუსი: ${apiResponse.status}`);
    }
    
    const data = await apiResponse.json();
    // ვამოწმებთ, რომ პასუხი შეიცავს მონაცემებს
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('CoinCatch-ზე მონაცემები ვერ მოიძებნა ან არასწორი პასუხია.');
    }
    
    // CoinCatch აბრუნებს მასივს ერთი ელემენტით, ამიტომ ვიღებთ პირველს
    response.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
    return response.status(200).json(data[0]);

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
