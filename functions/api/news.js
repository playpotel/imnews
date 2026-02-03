export async function onRequest() {
  const RSS_URL = "https://bnr.bg/rss";

  try {
    const response = await fetch(RSS_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/xml, application/xml"
      }
    });

    if (!response.ok) throw new Error(`Server BNR merespons dengan status: ${response.status}`);

    const xml = await response.text();

    // Parsing manual menggunakan split untuk menghindari masalah Regex
    const items = xml.split("<item>");
    items.shift(); // Buang bagian header XML

    const articles = items.map(item => {
      const getTag = (tag) => {
        const parts = item.split(`<${tag}>`);
        if (parts.length < 2) return "";
        const content = parts[1].split(`</${tag}>`)[0];
        // Bersihkan CDATA jika ada
        return content.replace("<![CDATA[", "").replace("]]>", "").trim();
      };

      const title = getTag("title");
      const link = getTag("link");
      const description = getTag("description").replace(/<[^>]*>?/gm, "").substring(0, 150);
      const pubDate = getTag("pubDate");
      
      // Ambil gambar dari tag <enclosure url="...">
      let img = "https://images.unsplash.com/photo-1585829365234-781fcd04c838?q=80&w=500";
      if (item.includes("enclosure")) {
        const imgMatch = item.match(/url="([^"]+)"/);
        if (imgMatch) img = imgMatch[1];
      }

      return {
        title,
        description: description + "...",
        url: link,
        urlToImage: img,
        publishedAt: pubDate,
        source: { name: "BNR.bg" }
      };
    }).filter(a => a.title.length > 0);

    if (articles.length === 0) throw new Error("XML berhasil diambil tapi tidak ada artikel terdeteksi.");

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
