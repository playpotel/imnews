export async function onRequest(context) {
  const RSS_URL = "https://news.google.com/rss/headlines/section/topic/NATION?hl=bg&gl=BG&ceid=BG:bg";

  try {
    const response = await fetch(RSS_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cf: { cacheEverything: true, cacheTtl: 900 } 
    });

    const xml = await response.text();
    const items = xml.split("<item>").slice(1);

    const articles = items.map((item) => {
      const getTag = (tag) => {
        const match = item.match(new RegExp(`<${tag}>(.*?)</${tag}>`, "s"));
        return match ? match[1].replace("<![CDATA[", "").replace("]]>", "").trim() : "";
      };

      const title = getTag("title");
      const link = getTag("link");
      const pubDate = getTag("pubDate");
      const sourceName = getTag("source");

      // LOGIKA GAMBAR SESUAI TOPIK
      // Mencari kata kunci di judul untuk menentukan kategori gambar
      const lowerTitle = title.toLowerCase();
      let category = "bulgaria,city"; // Default

      if (lowerTitle.includes("футбол") || lowerTitle.includes("спорт") || lowerTitle.includes("цска") || lowerTitle.includes("левски")) {
        category = "sports,soccer";
      } else if (lowerTitle.includes("политика") || lowerTitle.includes("избори") || lowerTitle.includes("парламент") || lowerTitle.includes("радев")) {
        category = "politics,government";
      } else if (lowerTitle.includes("бизнес") || lowerTitle.includes("икономика") || lowerTitle.includes("пари") || lowerTitle.includes("цена")) {
        category = "business,finance";
      } else if (lowerTitle.includes("война") || lowerTitle.includes("армия") || lowerTitle.includes("украйна")) {
        category = "military,war";
      } else if (lowerTitle.includes("времето") || lowerTitle.includes("дъжд") || lowerTitle.includes("сняг")) {
        category = "weather,nature";
      }

      // Gunakan Unsplash Source yang lebih akurat berdasarkan kategori
      const imageUrl = `https://images.unsplash.com/photo-1555914757-0639d4850785?q=80&w=800&auto=format&fit=crop`; // Default fallback
      
      // Kita buat URL dinamis berdasarkan kategori yang ditemukan
      const dynamicImage = `https://source.unsplash.com/featured/800x500?${category}&sig=${Math.abs(title.length)}`;

      return {
        title: title,
        description: "Вижте подробностите за тази актуална новина в пълния репортаж.",
        url: link,
        urlToImage: dynamicImage,
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
    return new Response(JSON.stringify({ error: "Error" }), { status: 500 });
  }
}
