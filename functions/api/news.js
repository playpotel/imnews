export async function onRequest() {
  // Sumber RSS Novinite - Sangat stabil dan terbuka
  const RSS_URL = "https://www.novinite.com/rss.php";

  try {
    const response = await fetch(RSS_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/xml"
      }
    });

    const xmlString = await response.text();

    // Regex sederhana untuk mengambil data dari XML (karena Cloudflare tidak punya DOMParser bawaan)
    const items = xmlString.split('<item>').slice(1); // Potong bagian atas, ambil per item

    const articles = items.map(item => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                    item.match(/<title>(.*?)<\/title>/)?.[1] || "";
      
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
      
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
      
      let description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || 
                        item.match(/<description>(.*?)<\/description>/)?.[1] || "";
      
      // Bersihkan deskripsi dari HTML dan karakter aneh
      description = description.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();

      return {
        title: title,
        description: description.substring(0, 150) + "...",
        url: link,
        urlToImage: "https://images.unsplash.com/photo-1523995462485-3d171b5c8fb9?q=80&w=500", // Placeholder stabil
        publishedAt: pubDate,
        source: { name: "Novinite.bg" }
      };
    });

    if (articles.length === 0) throw new Error("Format XML tidak dikenali");

    return new Response(JSON.stringify({ articles }), {
      headers: { 
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "Gagal memproses berita", 
      details: error.message 
    }), { status: 500 });
  }
}
