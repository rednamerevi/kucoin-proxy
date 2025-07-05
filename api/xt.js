// /api/xt.js - საბოლოო ვერსია

export default async function handler(request, response) {
  const { symbol } = request.query;

  if (!symbol) {
    return response.status(400).json({ error: 'Symbol parameter is required' });
  }

  const apiUrl = `https://sapi.xt.com/v4/public/ticker?symbol=${symbol}`;

  try {
    const apiResponse = await fetch(apiUrl);
    if (!apiResponse.ok) {
      throw new Error(`XT.com API responded with status: ${apiResponse.status}`);
    }
    const data = await apiResponse.json();

    if (data.rc !== 0 || !data.result || data.result.length === 0) {
      throw new Error('Pair not found on XT.com or API error');
    }

    const ticker = data.result[0];

    // ⭐ ვქმნით სტანდარტულ ობიექტს სწორი ველების გამოყენებით ⭐
    const formattedData = {
      askPrice: ticker.ap, // Ask price (იყო 'a')
      bidPrice: ticker.bp, // Bid price (იყო 'b')
      price: ticker.c,     // Last price (იყო 'p')
      time: ticker.t
    };

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return response.status(200).json(formattedData);

  } catch (error) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    return response.status(500).json({ error: error.message });
  }
}
