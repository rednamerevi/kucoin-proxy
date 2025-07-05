// File: /api/gateio.js
export default async function handler(req, res) {
    // Vercel ავტომატურად პარსავს query პარამეტრებს
    const { currency_pair } = req.query;

    if (!currency_pair) {
        return res.status(400).json({ error: 'currency_pair პარამეტრი აუცილებელია' });
    }

    try {
        const apiResponse = await fetch(`https://api.gateio.ws/api/v4/spot/tickers?currency_pair=${currency_pair}`);
        const data = await apiResponse.json();

        // თუ Gate.io-მ დააბრუნა შეცდომა ან ცარიელი მასივი
        if (!apiResponse.ok || (Array.isArray(data) && data.length === 0) || data.label) {
            return res.status(404).json({ error: `წყვილი ვერ მოიძებნა Gate.io-ზე` });
        }

        // ვაბრუნებთ პასუხს სწორი CORS ჰედერებით
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Gate.io აბრუნებს მასივს ერთი ელემენტით, ჩვენ გვჭირდება მხოლოდ ეს ობიექტი
        res.status(200).json(data[0]);

    } catch (error) {
        res.status(500).json({ error: 'Proxy სერვერის შეცდომა' });
    }
}
