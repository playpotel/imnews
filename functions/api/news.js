export async function onRequest() {
  // RSS Google News khusus Bulgaria (Bahasa Bulgaria)
  // Ini mengambil berita dari SEMUA media Bulgaria secara otomatis
  const RSS_URL = "https://news.google.com/rss/headlines/section/topic/NATION?hl=bg&gl=BG&ceid=BG:bg";

  try {
    const response = await fetch(RSS_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    const xml = await response.text();

    // Mencari setiap item berita
    const items = xml.split("<item>");
    items.shift(); // Buang header

    const articles = items.map(item => {
      const getTag = (tag) => {
        const match = item.match(new RegExp(`<${tag}>(.*?)</${tag}>`, "s"));
        return match ? match[1].replace("<![CDATA[", "").replace("]]>", "").trim() : "";
      };

      const title = getTag("title");
      const link = getTag("link");
      const pubDate = getTag("pubDate");
      const sourceName = getTag("source");

      return {
        title: title,
        description: "Вижте подробностите за тази актуална новина в пълния репортаж на оригиналния медиен източник.",
        url: link,
        urlToImage: `https://images.unsplash.com/photo-1523995462485-3d171b5c8fb9?q=80&w=800&sig=${Math.random()}`, // Gambar variatif
        publishedAt: pubDate,
        source: { name: sourceName || "Новини от България" }
      };
    }).filter(a => a.title.length > 0);

    return new Response(JSON.stringify({ articles }), {
      headers: { 
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
