const dist = 'apps/client/dist';
let indexHtml = '';
async function readIndex() {
  const file = Bun.file(`${dist}/index.html`);
  if (await file.exists()) indexHtml = await file.text();
}

export default {};

const server = Bun.serve({
  port: Number(Bun.env.PORT ?? 5173),
  async fetch(req) {
    const url = new URL(req.url);
    const filePath = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = Bun.file(`${dist}${filePath}`);
    if ((await file.exists()) && file.size > 0) {
      return new Response(file);
    }
    if (!indexHtml) await readIndex();
    return new Response(indexHtml || 'Not Found', {
      headers: { 'Content-Type': 'text/html' },
    });
  },
});

console.log(`Client serving on http://localhost:${server.port}`);
