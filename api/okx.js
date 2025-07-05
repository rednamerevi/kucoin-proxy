// ეს არის Vercel-ის სერვერული ფუნქცია OKX-ისთვის
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
    return response.status(400).json({ error: 'Symbol (instId) parameter is required' });
  }

  const apiUrl = `https://www.okx.com/api/v5/market/ticker?instId=${symbol}`;

  try {
    const apiResponse = await fetch(apiUrl);
    if (!apiResponse.ok) {
      throw new Error(`OKX API-მ დააბრუნა სტატუსი: ${apiResponse.status}`);
    }
    
    const data = await apiResponse.json();
    // OKX-ს "0" აქვს წარმატების კოდი
    if (data.code !== '0' || !data.data || data.data.length === 0) {
      throw new Error('OKX-ზე მონაცემები ვერ მოიძებნა.');
    }
    
    // OKX აბრუნებს მასივს ერთი ელემენტით, ამიტომ ვიღებთ პირველს
    response.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
    return response.status(200).json(data.data[0]);

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
