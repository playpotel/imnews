export async function onRequest() {
  // Kita gunakan RSS dari BNR (Bulgarian National Radio) yang sangat resmi
  const RSS_URL = "https://bnr.bg/rss";
  
  // Menggunakan API Feed khusus yang sering digunakan pengembang (gratis & stabil)
  const PROXY_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

  try {
    const response = await fetch(PROXY_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      // Jika BNR gagal, coba sumber cadangan: Novinite
      const backupResponse = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent("https://www.novinite.com/rss.php")}`);
      const backupData = await backupResponse.json();
      
      if (!backupData.items) throw new Error("Semua sumber berita gagal.");
      return formatData(backupData.items);
    }

    return formatData(data.items);

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "Gagal memproses berita", 
      details: error.message 
    }), { status: 500 });
  }
}

// Fungsi untuk merapikan format agar sesuai dengan index.html Anda
function formatData(items) {
  const articles = items.map(item => ({
    title: item.title,
    description: item.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...",
    url: item.link,
    urlToImage: item.enclosure?.link || item.thumbnail || "https://images.unsplash.com/photo-1585829365234-781fcd04c838?q=80&w=500",
    publishedAt: item.pubDate,
    source: { name: "Bulgaria News" }
  }));

  return new Response(JSON.stringify({ articles }), {
    headers: { 
      "Content-Type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
