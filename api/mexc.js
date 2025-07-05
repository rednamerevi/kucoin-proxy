// File: /api/mexc.js
export default async function handler(req, res) {
    const { symbol } = req.query;

    if (!symbol) {
        return res.status(400).json({ error: 'symbol პარამეტრი აუცილებელია' });
    }

    try {
        const apiResponse = await fetch(`https://api.mexc.com/api/v3/ticker/bookTicker?symbol=${symbol}`);
        const data = await apiResponse.json();

        // თუ MEXC-მ დააბრუნა შეცდომის კოდი
        if (!apiResponse.ok || data.code) {
             return res.status(404).json({ error: `წყვილი ვერ მოიძებნა MEXC-ზე` });
        }

        // ვაბრუნებთ პასუხს სწორი CORS ჰედერებით
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error: 'Proxy სერვერის შეცდომა' });
    }
}
