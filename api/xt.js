// Vercel-ის სერვერული ფუნქცია XT.com-ისთვის
export default async function handler(request, response) {
  // CORS-ის თავსართები
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // ვიღებთ სიმბოლოს, მაგ: ?symbol=btc_usdt
  const { symbol } = request.query;

  if (!symbol) {
    return response.status(400).json({ error: 'Symbol parameter is required' });
  }

  const apiUrl = `https://www.xt.com/s/api/v4/public/ticker?symbol=${symbol}`;

  try {
    const apiResponse = await fetch(apiUrl);
    if (!apiResponse.ok) {
      throw new Error(`XT.com API-მ დააბრუნა სტატუსი: ${apiResponse.status}`);
    }
    
    const data = await response.json();
    if (!data.result || data.result.length === 0) {
      throw new Error('XT.com-ზე მონაცემები ვერ მოიძებნა.');
    }
    
    response.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
    // XT.com აბრუნებს მასივს, ვიღებთ პირველ ელემენტს
    return response.status(200).json(data.result[0]);

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
