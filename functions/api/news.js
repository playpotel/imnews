export async function onRequest(context) {
  // Masukkan API Key di sini atau gunakan Environment Variable (lebih aman)
  const API_KEY = "d1de5e1faee34acab3ed96dd2b1e62b4"; 
  const url = `https://newsapi.org/v2/top-headlines?country=bg&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Cloudflare-Pages-Function" }
    });
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Gagal mengambil berita" }), { status: 500 });
  }
}
