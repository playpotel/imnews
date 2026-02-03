export async function onRequest() {
  // Gunakan sumber paling stabil: Novinite (karena XML-nya lebih standar)
  const RSS_URL = "https://www.novinite.com/rss.php";

  try {
    const response = await fetch(RSS_URL, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const xml = await response.text();

    // Regex global untuk menangkap item tanpa peduli case-sensitive (huruf besar/kecil)
    // Mencari segala sesuatu di antara <item> ... </item>
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    const articles = [];

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemContent = match[1];

      // Fungsi ekstraksi yang sangat kuat (Mendukung CDATA dan teks biasa)
      const extract = (tag) => {
        const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i");
        const m = itemContent.match(regex);
        return m ? m[1].trim() : "";
      };

      const title = extract("title");
      const link = extract("link");
      const pubDate = extract("pubDate");
      let description = extract("description")
        .replace(/<[^>]*>?/gm, "") // Buang HTML
        .replace(/&nbsp;/g, " ")
        .substring(0, 160);

      if (title) {
        articles.push({
          title,
          description: description + "...",
          url: link,
          urlToImage: "https://images.unsplash.com/photo-1523995462485-3d171b5c8fb9?q=80&w=500",
          publishedAt: pubDate,
          source: { name: "Novinite" }
        });
      }
    }

    if (articles.length === 0) {
        // Jika masih gagal, kita berikan 1 berita manual agar website tidak kosong sama sekali
        articles.push({
            title: "Новините се обновяват",
            description: "Моля, освежете страницата след малко за най-новите събития от България.",
            url: "https://www.novinite.com",
            urlToImage: "",
            publishedAt: new Date().toISOString(),
            source: { name: "Система" }
        });
    }

    return new Response(JSON.stringify({ articles }), {
      headers: { 
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Error", details: error.message }), { status: 500 });
  }
}
