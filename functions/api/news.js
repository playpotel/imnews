export async function onRequest() {
  // Kita ambil langsung dari halaman utama Dnevnik.bg (sangat stabil)
  const TARGET_URL = "https://www.dnevnik.bg/allnews/";

  try {
    const response = await fetch(TARGET_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "bg-BG,bg;q=0.9"
      }
    });

    const html = await response.text();
    const articles = [];

    // Mencari blok berita di HTML Dnevnik
    // Kita gunakan pemotongan string manual agar sangat ringan di Cloudflare
    const items = html.split('<article').slice(1, 13); // Ambil 12 berita terbaru

    items.forEach(item => {
      // Ekstrak Judul
      const titleMatch = item.match(/title="([^"]+)"/) || item.match(/>([^<]+)<\/a><\/h2>/);
      const title = titleMatch ? titleMatch[1] : "";

      // Ekstrak Link
      const linkMatch = item.match(/href="([^"]+)"/);
      let link = linkMatch ? linkMatch[1] : "";
      if (link && !link.startsWith('http')) link = "https://www.dnevnik.bg" + link;

      // Ekstrak Gambar
      const imgMatch = item.match(/data-src="([^"]+)"/) || item.match(/src="([^"]+)"/);
      let img = imgMatch ? imgMatch[1] : "https://images.unsplash.com/photo-1585829365234-781fcd04c838?q=80&w=500";

      // Ekstrak Waktu (jika ada)
      const dateMatch = item.match(/<time[^>]*>([^<]+)<\/time>/);
      const date = dateMatch ? dateMatch[1] : "Днес";

      if (title && link) {
        articles.push({
          title: title.trim(),
          description: "Актуализирани новини от водещия български портал Дневник. Прочетете целия репортаж тук.",
          url: link,
          urlToImage: img,
          publishedAt: date,
          source: { name: "Dnevnik.bg" }
        });
      }
    });

    return new Response(JSON.stringify({ articles }), {
      headers: { 
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Gagal scrape", details: error.message }), { status: 500 });
  }
}
