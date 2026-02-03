export async function onRequest(context) {
  const API_KEY = "d1de5e1faee34acab3ed96dd2b1e62b4"; 
  
  // Strategi Baru: Mencari berita dengan kata kunci "Bulgaria" dalam bahasa Bulgaria (България)
  // Ini jauh lebih akurat dan jarang kosong dibandingkan filter 'country=bg'
  const query = encodeURIComponent("България");
  const url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=12&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    const data = await response.json();

    if (data.status !== "ok") {
      return new Response(JSON.stringify({ error: data.message }), { status: 200 });
    }

    // Jika hasil 'everything' masih kosong, kita berikan artikel cadangan
    const articles = data.articles.length > 0 ? data.articles.map(article => ({
      title: article.title,
      description: article.description || "Няма налично описание.",
      url: article.url,
      urlToImage: article.urlToImage || "https://images.unsplash.com/photo-1523995462485-3d171b5c8fb9?q=80&w=500",
      publishedAt: article.publishedAt,
      source: { name: article.source.name || "Новини" }
    })) : [{
      title: "Новините се обновяват",
      description: "В момента няма нови статии. Моля, проверете по-късно.",
      url: "#",
      urlToImage: "",
      publishedAt: new Date().toISOString(),
      source: { name: "Система" }
    }];

    return new Response(JSON.stringify({ articles }), {
      headers: { 
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
  }
}
