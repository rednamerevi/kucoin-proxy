export default async function handler(request, response) {
  const { symbol } = request.query;

  if (!symbol) {
    return response.status(400).json({ error: 'Symbol parameter is required' });
  }

  const apiUrl = `https://api.xt.com/data/api/v1/getTicker?symbol=${symbol}`;

  try {
    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      throw new Error(`XT.com API responded with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    // ⭐ ყველაზე მთავარი ხაზი!
    // ეს აძლევს უფლებას თქვენს ლოკალურ HTML ფაილს, რომ მიიღოს პასუხი.
    response.setHeader('Access-Control-Allow-Origin', '*');

    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return response.status(200).json(data);

  } catch (error) {
    // შეცდომის შემთხვევაშიც ვაძლევთ დაკავშირების უფლებას
    response.setHeader('Access-Control-Allow-Origin', '*');
    return response.status(500).json({ error: error.message });
  }
