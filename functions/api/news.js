export async function onRequest(context) {
  // Masukkan API Key gratis Anda di sini
  const API_KEY = "d1de5e1faee34acab3ed96dd2b1e62b4"; 
  
  // URL untuk mengambil berita utama dari Bulgaria
  const url = `https://newsapi.org/v2/top-headlines?country=bg&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url, {
      headers: {
        // NewsAPI versi gratis mewajibkan adanya User-Agent
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    const data = await response.json();

    // Jika API Key salah atau limit tercapai, NewsAPI akan mengirim status "error"
    if (data.status !== "ok") {
      return new Response(JSON.stringify({ 
        error: "API Error", 
        details: data.message 
      }), { status: 200 }); // Tetap return 200 agar kita bisa baca pesannya di browser
    }

    // Ambil maksimal 12 artikel terbaru
    const articles = data.articles.slice(0, 12).map(article => ({
      title: article.title,
      description: article.description || "Няма налично описание за тази новина.",
      url: article.url,
      urlToImage: article.urlToImage || "https://images.unsplash.com/photo-1523995462485-3d171b5c8fb9?q=80&w=500",
      publishedAt: article.publishedAt,
      source: { name: article.source.name || "Новини" }
    }));

    return new Response(JSON.stringify({ articles }), {
      headers: { 
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Server Error", details: error.message }), { status: 500 });
  }
}
