export async function onRequest() {
  // Mengambil RSS Feed dari BNR (Bulgarian National Radio) - Sangat Stabil
  const RSS_URL = "https://bnr.bg/rss";
  // Menggunakan RSS2JSON converter gratis agar mudah dibaca oleh Javascript
  const CONVERTER_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

  try {
    const response = await fetch(CONVERTER_URL);
    const data = await response.json();

    // Mapping data agar sesuai dengan format yang diharapkan index.html
    const articles = data.items.map(item => ({
      title: item.title,
      description: item.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...', // Bersihkan tag HTML
      url: item.link,
      urlToImage: item.enclosure.link || item.thumbnail || null,
      publishedAt: item.pubDate,
      source: { name: "BNR.bg" }
    }));

    return new Response(JSON.stringify({ articles }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Gagal memuat RSS" }), { status: 500 });
  }
}
