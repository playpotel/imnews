export async function onRequest() {
  // Menggunakan RSS dari Novinite (Salah satu yang paling stabil untuk di-fetch)
  const RSS_URL = "https://www.novinite.com/rss.php";
  const CONVERTER_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

  try {
    const response = await fetch(CONVERTER_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error('RSS Converter gagal');
    }

    // Transformasi data agar cocok dengan index.html Anda
    const articles = data.items.map(item => {
      // Membersihkan teks dari tag HTML yang sering muncul di RSS
      const cleanDescription = item.description
        .replace(/<[^>]*>?/gm, '') 
        .replace(/&nbsp;/g, ' ')
        .substring(0, 150) + '...';

      return {
        title: item.title,
        description: cleanDescription,
        url: item.link,
        urlToImage: item.enclosure?.link || item.thumbnail || "https://images.unsplash.com/photo-1523995462485-3d171b5c8fb9?q=80&w=500", // Image cadangan jika RSS tidak sedia gambar
        publishedAt: item.pubDate,
        source: { name: "Novinite.bg" }
      };
    });

    return new Response(JSON.stringify({ articles }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=1800" // Simpan cache 30 menit agar cepat
      }
    });

  } catch (error) {
    // Jika gagal, berikan data "Hardcoded" agar website tidak terlihat rusak
    const fallbackData = {
      articles: [
        {
          title: "Временно прекъсване на емисията",
          description: "В момента обновяваме новинарския поток. Моля, опитайте отново след няколко минути.",
          url: "#",
          urlToImage: "",
          publishedAt: new Date().toISOString(),
          source: { name: "Система" }
        }
      ]
    };
    return new Response(JSON.stringify(fallbackData), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
