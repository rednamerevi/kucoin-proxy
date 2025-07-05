// File: /api/xt.js (გაუმჯობესებული ლოგირებით)
export default async function handler(req, res) {
    const { symbol } = req.query;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (!symbol) {
        return res.status(400).json({ error: 'symbol პარამეტრი აუცილებელია' });
    }

    try {
        const targetUrl = `https://api.xt.com/v4/public/ticker?symbol=${symbol}`;
        const apiResponse = await fetch(targetUrl);

        // ვლოგავთ გარე API-დან მიღებულ სტატუსს
        console.log(`[xt.js] Upstream API status for ${symbol}: ${apiResponse.status}`);

        const responseText = await apiResponse.text(); // ტექსტად წამოღება, რათა JSON-ის შეცდომა ავირიდოთ
        const data = JSON.parse(responseText);

        if (!apiResponse.ok || data.rc !== 0 || !data.result || data.result.length === 0) {
            console.error(`[xt.js] Error from XT.com API for ${symbol}:`, data);
            return res.status(404).json({ error: `წყვილი ვერ მოიძებნა XT.com-ზე`, details: data });
        }

        return res.status(200).json(data.result[0]);

    } catch (error) {
        // ვლოგავთ სრულ შეცდომას, თუ რამე მოხდა
        console.error(`[xt.js] Fatal error in proxy for symbol ${symbol}:`, error);
        return res.status(500).json({ error: 'Proxy სერვერის შიდა შეცდომა', details: error.message });
    }
}
