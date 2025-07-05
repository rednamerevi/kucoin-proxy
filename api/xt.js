// ⭐ განახლებული XT.com ფუნქცია (Vercel პროქსის გამოყენებით)
async function fetchXtTickerData(symbol) {
    // XT.com-ის API-ს სჭირდება პატარა ასოებით და ქვედა ტირეთი, მაგ. btc_usdt
    const xtSymbol = `${symbol.toLowerCase()}_usdt`; 
    
    // შენი პროქსის მისამართი Vercel-ზე იქნება /api/xt
    const requestUrl = `/api/xt?symbol=${xtSymbol}`; 

    const response = await fetch(requestUrl);
    
    if (!response.ok) {
        // თუ პროქსი დააბრუნებს შეცდომას, მას აქ დავიჭერთ
        const errorData = await response.json();
        throw new Error(`XT.com Proxy შეცდომა: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data || !data.price) {
        throw new Error(`წყვილი ვერ მოიძებნა`);
    }

    // ვამატებთ სიმბოლს, რადგან API-ს პასუხში არ მოდის და ჩვენ გვჭირდება
    return { exchange: 'XT.com', ...data, symbol: xtSymbol }; 
}
