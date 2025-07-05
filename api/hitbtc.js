// ეს არის Vercel-ის სერვერული ფუნქცია HitBTC-ისთვის
export default async function handler(request, response) {
  // 1. ვამატებთ CORS-ის თავსართებს
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS მოთხოვნის დამუშავება
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // 2. ვიღებთ სიმბოლოს, რომელსაც ჩვენი აპლიკაცია გადმოგვცემს (მაგ: ?symbol=BTCUSDT)
  const { symbol } = request.query;

  if (!symbol) {
    return response.status(400).json({ error: 'Symbol parameter is required' });
  }

  // 3. HitBTC-ის API-ს მისამართი
  const hitbtcUrl = `https://api.hitbtc.com/api/3/public/ticker/${symbol}`;

  try {
    // 4. ჩვენი სერვერი უკავშირდება HitBTC-ის API-ს
    const apiResponse = await fetch(hitbtcUrl);

    if (!apiResponse.ok) {
      throw new Error(`HitBTC API-მ დააბრუნა სტატუსი: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    // 5. წარმატების შემთხვევაში, მიღებულ მონაცემებს ვუბრუნებთ ჩვენს აპლიკაციას
    response.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate'); // კეშირება 10 წამით
    return response.status(200).json(data);

  } catch (error) {
    // 6. შეცდომის შემთხვევაში, ვაბრუნებთ შეცდომის შეტყობინებას
    return response.status(500).json({ error: error.message });
  }
}
