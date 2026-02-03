export async function onRequest(context) {
  const { env } = context;
  const RSS_URL = "https://news.google.com/rss/headlines/section/topic/NATION?hl=bg&gl=BG&ceid=BG:bg";

  try {
    const response = await fetch(RSS_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      cf: { cacheEverything: true, cacheTtl: 600 } 
    });

    const xml = await response.text();
    const items = xml.split("<item>").slice(1);

    const articles = await Promise.all(items.map(async (item) => {
      const getTag = (tag) => {
        const match = item.match(new RegExp(`<${tag}>(.*?)</${tag}>`, "s"));
        return match ? match[1].replace("<![CDATA[", "").replace("]]>", "").trim() : "";
      };

      const title = getTag("title");
      const link = getTag("link");
      const pubDate = getTag("pubDate");
      const sourceName = getTag("source");

      // 1. BUAT ID PERMANEN BERDASARKAN JUDUL
      // Menggunakan Base64 singkat dari judul agar ID konsisten & permanen
      const cleanTitle = title.split(' - ')[0]; // Ambil judul utama saja
      const id = btoa(unescape(encodeURIComponent(cleanTitle)))
                 .substring(0, 10)
                 .replace(/[/+]/g, 'x'); // ID Cantik 10 karakter

      // 2. LOGIKA GAMBAR BERDASARKAN TOPIK
      const lowerTitle = title.toLowerCase();
      let searchTag = "bulgaria,landscape";
      if (lowerTitle.includes("футбол") || lowerTitle.includes("спорт")) searchTag = "soccer,sports";
      else if (lowerTitle.includes("политика") || lowerTitle.includes("избори")) searchTag = "government,politics";
      else if (lowerTitle.includes("бизнес") || lowerTitle.includes("пари")) searchTag = "finance,business";
      else if (lowerTitle.includes("инцидент") || lowerTitle.includes("катастрофа")) searchTag = "police,emergency";

      const imageUrl = `https://loremflickr.com/800/500/${searchTag}?lock=${id.length}`;

      const articleData = {
        id: id,
        title: title,
        description: "Прочетете пълния репортаж от източника за повече информация относно това събитие.",
        url: link,
        urlToImage: imageUrl,
        publishedAt: pubDate,
        source: { name: sourceName || "Новини" }
      };

      // 3. SIMPAN KE KV (Database Permanen)
      // Ini membuat artikel tidak hilang meskipun sudah lewat berhari-hari
      try {
        await env.NEWS_STORAGE.put(id, JSON.stringify(articleData));
      } catch (kvError) {
        console.error("KV Storage Error:", kvError);
      }

      return articleData;
    }));

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
