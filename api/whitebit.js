// /api/whitebit.js

export default async function handler(request, response) {
  // WhiteBIT-ის API ყველა წყვილს ერთად აბრუნებს, ამიტომ სიმბოლო აქ არ გვჭირდება
  const apiUrl = `https://whitebit.com/api/v4/public/ticker`;

  try {
    const apiResponse = await fetch(apiUrl);
    if (!apiResponse.ok) {
      throw new Error(`WhiteBIT API responded with status: ${apiResponse.status}`);
    }
    const data = await apiResponse.json();

    // ვაბრუნებთ სრულ მონაცემებს, ფილტრაციას ფრონტენდი გააკეთებს
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return response.status(200).json(data);

  } catch (error) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    return response.status(500).json({ error: error.message });
  }
}
