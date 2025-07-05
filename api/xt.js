// File: /api/xt.js
export default async function handler(req, res) {
    const { symbol } = req.query;

    if (!symbol) {
        return res.status(400).json({ error: 'symbol პარამეტრი აუცილებელია' });
    }

    try {
        const apiResponse = await fetch(`https://api.xt.com/v4/public/ticker?symbol=${symbol}`);
        const data = await apiResponse.json();

        // XT.com-ის API-ს წარმატების კოდია 0. ვამოწმებთ ამას და ასევე, რომ შედეგი არ არის ცარიელი.
        if (!apiResponse.ok || data.rc !== 0 || !data.result || data.result.length === 0) {
            return res.status(404).json({ error: `წყვილი ვერ მოიძებნა XT.com-ზე` });
        }

        // ვაბრუნებთ პასუხს CORS ჰედერებით
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // XT.com აბრუნებს მასივს, ჩვენ გვჭირდება პირველი ელემენტი
        res.status(200).json(data.result[0]);

    } catch (error) {
        res.status(500).json({ error: 'Proxy სერვერის შეცდომა' });
    }
}
