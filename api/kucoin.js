// ეს არის Vercel-ის სერვერული ფუნქცია
export default async function handler(request, response) {
  // ნაბიჯი 1: ვამატებთ CORS-ის თავსართებს. ეს საშუალებას აძლევს ჩვენს მთავარ HTML ფაილს, რომ ამ ბმულს დაუკავშირდეს.
  response.setHeader('Access-Control-Allow-Origin', '*'); // ნებისმიერ საიტს ვაძლევთ წვდომის უფლებას
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS მოთხოვნის დამუშავება
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // ნაბიჯი 2: ვიღებთ მონეტის სიმბოლოს, რომელსაც ჩვენი HTML ფაილი გადმოგვცემს (მაგ: ?symbol=BTC-USDT)
  const { symbol } = request.query;

  // თუ სიმბოლო არ არის გადმოცემული, ვაბრუნებთ შეცდომას
  if (!symbol) {
    return response.status(400).json({ error: 'Symbol parameter is required' });
  }

  // ნაბიჯი 3: KuCoin-ის API-ს მისამართი
  const kucoinUrl = `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${symbol}`;

  try {
    // ნაბიჯი 4: ჩვენი სერვერი უკავშირდება KuCoin-ის API-ს
    const apiResponse = await fetch(kucoinUrl);

    if (!apiResponse.ok) {
      throw new Error(`KuCoin API returned status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    if (data.code !== '200000' || !data.data) {
      throw new Error(`KuCoin-ზე მონაცემები ვერ მოიძებნა ან არასწორი პასუხია.`);
    }
    
    // ნაბიჯი 5: წარმატების შემთხვევაში, მიღებულ მონაცემებს ვუბრუნებთ პასუხად ჩვენს HTML ფაილს
    response.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate'); // ვამატებთ კეშირებას 10 წამით
    return response.status(200).json(data.data);

  } catch (error) {
    // ნაბიჯი 6: შეცდომის შემთხვევაში, ვაბრუნებთ შეცდომის შეტყობინებას
    return response.status(500).json({ error: error.message });
  }
}
