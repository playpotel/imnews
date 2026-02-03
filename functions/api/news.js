export async function onRequest() {
  // Menggunakan News.bg - Salah satu RSS paling stabil di Bulgaria
  const RSS_URL = "https://news.bg/rss";

  try {
    const response = await fetch(RSS_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      }
    });

    const xmlString = await response.text();

    // Memisahkan berdasarkan tag <item>
    const items = xmlString.split('<item>');
    items.shift(); // Buang bagian sebelum item pertama

    const articles = items.map(item => {
      // Fungsi pembantu untuk mengekstrak teks di antara tag
      const extract = (tag) => {
        const match = item.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 's'));
        return match ? match[1].trim() : '';
      };

      const title = extract('title');
      const link = extract('link');
      const pubDate = extract('pubDate');
      let description = extract('description');
      
      // Bersihkan HTML dari deskripsi
      description = description.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ');

      return {
        title: title,
        description: description.substring(0, 150) + "...",
        url: link,
        urlToImage: "https://images.unsplash.com/photo-1585829365234-781fcd04c838?q=80&w=500", // Placeholder
        publishedAt: pubDate,
        source: { name: "News.bg" }
      };
    }).filter(a => a.title !== ""); // Pastikan tidak ada item kosong

    if (articles.length === 0) throw new Error("Tidak ada artikel yang terurai");

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
