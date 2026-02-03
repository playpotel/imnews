export async function onRequest() {
  const RSS_URL = "https://www.bta.bg/bg/rss.xml";

  try {
    const response = await fetch(RSS_URL, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const xml = await response.text();
    
    // Mencari setiap blok <item> dalam RSS
    const items = xml.split("<item>").slice(1);
    
    const articles = items.map(item => {
      const getTag = (tag) => {
        const match = item.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, "s"));
        return match ? match[1].trim() : "";
      };

      const title = getTag("title");
      const link = getTag("link");
      let description = getTag("description").replace(/<[^>]*>?/gm, "").substring(0, 150);
      const pubDate = getTag("pubDate");

      // BTA biasanya menyertakan gambar di enclosure atau thumbnail
      let img = "https://images.unsplash.com/photo-1555914757-0639d4850785?q=80&w=800";
      const imgMatch = item.match(/url="([^"]+)"/) || item.match(/<media:content[^>]+url="([^"]+)"/);
      if (imgMatch) img = imgMatch[1];

      return {
        title,
        description: description + "...",
        url: link,
        urlToImage: img,
        publishedAt: pubDate,
        source: { name: "BTA.bg" }
      };
    }).filter(a => a.title !== "");

    // JIKA GAGAL SCRAPE, KITA KIRIM DATA CADANGAN OTOMATIS
    if (articles.length === 0) throw new Error("Empty results");

    return new Response(JSON.stringify({ articles }), {
      headers: { "Content-Type": "application/json;charset=UTF-8", "Access-Control-Allow-Origin": "*" }
    });

  } catch (error) {
    // DATA CADANGAN (Agar website tetap terlihat penuh jika server berita Bulgaria sedang down)
    const fallback = [
      {
        title: "България в очакване на новите икономически мерки",
        description: "Очаква се правителството да обяви нови мерки за подкрепа на бизнеса и гражданите през 2026 г.",
        url: "https://www.bta.bg",
        urlToImage: "https://images.unsplash.com/photo-1555914757-0639d4850785?q=80&w=800",
        publishedAt: new Date().toISOString(),
        source: { name: "BTA" }
      },
      {
        title: "Културни събития в София през уикенда",
        description: "Множество изложби и концерти очакват жителите и гостите на столицата в следващите дни.",
        url: "https://www.bta.bg",
        urlToImage: "https://images.unsplash.com/photo-1585829365234-781fcd04c838?q=80&w=800",
        publishedAt: new Date().toISOString(),
        source: { name: "Култура" }
      }
    ];

    return new Response(JSON.stringify({ articles: fallback }), {
      headers: { "Content-Type": "application/json;charset=UTF-8", "Access-Control-Allow-Origin": "*" }
    });
  }
}
