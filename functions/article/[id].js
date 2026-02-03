export async function onRequestGet(context) {
  const { env, params, request } = context;
  const articleId = params.id;

  // 1. Ambil data artikel dari Cloudflare KV
  const data = await env.NEWS_STORAGE.get(articleId);
  
  // 2. Ambil file article.html sebagai template
  const url = new URL(request.url);
  const response = await fetch(`${url.origin}/article.html`);
  let html = await response.text();

  if (data) {
    const article = JSON.parse(data);

    // 3. SERVER-SIDE INJECTION (Kunci agar OG Image muncul di FB)
    // Kita mengganti placeholder meta tag dengan data asli
    html = html.replace(/<title id="page-title">.*?<\/title>/, `<title>${article.title} | България24</title>`);
    html = html.replace('id="meta-desc" content=""', `id="meta-desc" content="${article.title} - Прочетете повече на България24."`);
    html = html.replace('id="og-title" content=""', `id="og-title" content="${article.title}"`);
    html = html.replace('id="og-img" content=""', `id="og-img" content="${article.urlToImage}"`);
    html = html.replace('id="og-url" content=""', `id="og-url" content="${url.href}"`);
  }

  return new Response(html, {
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  });
}
