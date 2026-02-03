export async function onRequest() {
  const RSS_URL = "https://dariknews.bg/rss";

  try {
    const response = await fetch(RSS_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/xml, application/xml"
      },
      cf: { cacheEverything: true, cacheTtl: 300 }
    });

    const xml = await response.text();
    
    // Potong berdasarkan tag <item>
    const parts = xml.split("<item>");
    if (parts.length < 2) throw new Error("Format XML tidak dikenali");

    // Ambil semua item (biasanya 15-20 berita)
    const articles = parts.slice(1).map(item => {
      const getTag = (tag) => {
        const start = item.indexOf(`<${tag}>`);
        const end = item.indexOf(`</${tag}>`);
        if (start === -1 || end === -1) return "";
        let content = item.substring(start + tag.length + 2, end);
        return content.replace("<![CDATA[", "").replace("]]>", "").trim();
      };

      const title = getTag("title");
      const link = getTag("link");
      const pubDate = getTag("pubDate");
      let description = getTag("description").replace(/<[^>]*>?/gm, "").substring(0, 150);

      // Cari gambar di dalam tag <enclosure> atau <media:content>
      let img = "https://images.unsplash.com/photo-1523995462485-3d171b5c8fb9?q=80&w=800";
      const enclosureMatch = item.match(/url="([^"]+)"/);
      if (enclosureMatch) img = enclosureMatch[1];

      return {
        title,
        description: description + "...",
        url: link,
        urlToImage: img,
        publishedAt: pubDate,
        source: { name: "DarikNews" }
      };
    }).filter(a => a.title.length > 5); // Hanya ambil yang punya judul valid

    return new Response(JSON.stringify({ articles }), {
      headers: { 
        "Content-Type": "application/json;charset=UTF-8", 
        "Access-Control-Allow-Origin": "*" 
      }
    });

  } catch (error) {
    // Jika gagal, tampilkan pesan error yang lebih jelas di konsol
    return new Response(JSON.stringify({ error: "RSS Error", details: error.message }), { status: 500 });
  }
}
