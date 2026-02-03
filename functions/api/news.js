export async function onRequest() {
  // Menggunakan DarikNews RSS - Sangat kaya konten (biasanya 15-20 berita)
  const RSS_URL = "https://dariknews.bg/rss";
  // Gunakan RSS2JSON dengan API Key publik (tidak perlu daftar)
  const CONVERTER_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}&api_key=00000000000000000000000000000000`; // Placeholder key sering bekerja untuk publik

  try {
    const response = await fetch(CONVERTER_URL);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error('Tidak ada item ditemukan');
    }

    // Mapping semua artikel yang masuk
    const articles = data.items.map(item => {
      // Ekstrak gambar dari deskripsi jika tidak ada di enclosure (ciri khas RSS Bulgaria)
      let imageUrl = item.enclosure?.link || item.thumbnail;
      
      if (!imageUrl && item.description.includes('<img')) {
        const match = item.description.match(/src="([^"]+)"/);
        imageUrl = match ? match[1] : null;
      }

      return {
        title: item.title,
        description: item.description
          .replace(/<[^>]*>?/gm, '') // Bersihkan HTML
          .replace(/&nbsp;/g, ' ')
          .substring(0, 160) + '...',
        url: item.link,
        urlToImage: imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=500",
        publishedAt: item.pubDate,
        source: { name: "DarikNews" }
      };
    });

    return new Response(JSON.stringify({ articles }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=600" // Cache 10 menit
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "Gagal ambil berita", 
      details: error.message 
    }), { status: 500 });
  }
}
