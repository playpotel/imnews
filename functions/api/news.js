export async function onRequest(context) {
  const RSS_URL = "https://news.google.com/rss/headlines/section/topic/NATION?hl=bg&gl=BG&ceid=BG:bg";

  try {
    const response = await fetch(RSS_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
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

      // LOGIKA GAMBAR CERDAS: Mencari kata kunci untuk gambar yang relevan
      const lowerTitle = title.toLowerCase();
      let searchTag = "bulgaria,landscape";

      if (lowerTitle.includes("футбол") || lowerTitle.includes("спорт")) searchTag = "soccer,sports";
      else if (lowerTitle.includes("политика") || lowerTitle.includes("избори") || lowerTitle.includes("радев")) searchTag = "parliament,politics";
      else if (lowerTitle.includes("бизнес") || lowerTitle.includes("икономика") || lowerTitle.includes("пари")) searchTag = "finance,business";
      else if (lowerTitle.includes("софия") || lowerTitle.includes("пловдив") || lowerTitle.includes("варна")) searchTag = "city,bulgaria";
      else if (lowerTitle.includes("инцидент") || lowerTitle.includes("катастрофа")) searchTag = "police,emergency";

      // LoremFlickr sangat stabil untuk Cloudflare
      const imageUrl = `https://loremflickr.com/800/500/${searchTag}?lock=${index}`;

      return {
        title,
        description: "Прочетете пълния репортаж от източника за повече информация относно това събитие.",
        url: link,
        urlToImage: imageUrl,
        publishedAt: pubDate,
        source: { name: sourceName || "Новини" }
      };
    });

    return new Response(JSON.stringify({ articles }), {
      headers: { 
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Fetch Error" }), { status: 500 });
  }
}
