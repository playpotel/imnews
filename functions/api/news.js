export async function onRequest(context) {
  const RSS_URL = "https://news.google.com/rss/headlines/section/topic/NATION?hl=bg&gl=BG&ceid=BG:bg";

  try {
    const response = await fetch(RSS_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      // Cache di sisi Cloudflare selama 15 menit untuk performa & keamanan
      cf: { cacheEverything: true, cacheTtl: 900 } 
    });

    const xml = await response.text();
    const items = xml.split("<item>").slice(1);

    const articles = items.map((item, index) => {
      const getTag = (tag) => {
        const match = item.match(new RegExp(`<${tag}>(.*?)</${tag}>`, "s"));
        return match ? match[1].replace("<![CDATA[", "").replace("]]>", "").trim() : "";
      };

      const title = getTag("title");
      const link = getTag("link");
      const pubDate = getTag("pubDate");
      const sourceName = getTag("source");

      // OPTIMASI GAMBAR: Menggunakan placeholder berkualitas tinggi yang berganti sesuai index
      // Kita gunakan koleksi 'business' dan 'politics' agar relevan dengan berita
      const imgId = (index % 10) + 1; 
      const imageUrl = `https://picsum.photos/seed/bgnews${index}/800/500`;

      return {
        title: title,
        description: "Вижте подробностите за тази актуална новина в пълния репортаж на оригиналния източник.",
        url: link,
        urlToImage: imageUrl,
        publishedAt: pubDate,
        source: { name: sourceName || "Новини" }
      };
    });

    return new Response(JSON.stringify({ articles }), {
      headers: { 
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*", // Bisa diganti dengan domain spesifik Anda untuk keamanan ekstra
        "Cache-Control": "public, max-age=900" 
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
  }
}
