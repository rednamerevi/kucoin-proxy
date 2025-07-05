// ეს არის Vercel-ის სერვერული ფუნქცია AscendEX-ისთვის
export default async function handler(request, response) {
  // 1. CORS-ის თავსართები
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // 2. ვიღებთ სიმბოლოს, მაგ: ?symbol=BTC/USDT
  const { symbol } = request.query;

  if (!symbol) {
    return response.status(400).json({ error: 'Symbol parameter is required' });
  }

  // 3. AscendEX-ის API-ს მისამართი
  const apiUrl = `https://ascendex.com/api/pro/v1/spot/ticker?symbol=${symbol}`;

  try {
    // 4. ჩვენი სერვერი უკავშირდება AscendEX-ის API-ს
    const apiResponse = await fetch(apiUrl);
    if (!apiResponse.ok) throw new Error(`AscendEX API-მ დააბრუნა სტატუსი: ${apiResponse.status}`);
    
    const data = await apiResponse.json();
    if (data.code !== 0 || !data.data) throw new Error('AscendEX-ზე მონაცემები ვერ მოიძებნა.');
    
    // 5. წარმატების შემთხვევაში, პასუხს ვუბრუნებთ ჩვენს აპლიკაციას
    response.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
    return response.status(200).json(data.data);

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
