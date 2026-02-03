export async function onRequestGet(context) {
  const { params } = context;
  const articleId = params.id; // Menangkap '503034' dari URL

  // Ambil data asli dari index.html (kita gunakan sebagai template)
  const url = new URL(context.request.url);
  const templateUrl = `${url.origin}/article.html`;
  
  const response = await fetch(templateUrl);
  let html = await response.text();

  // Di sini Anda bisa menambahkan logika untuk mengambil data spesifik dari Database/API 
  // berdasarkan ID jika sudah punya DB. Untuk sekarang, kita biarkan article.html 
  // yang menangani sisa logikanya via JS.

  return new Response(html, {
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  });
}
