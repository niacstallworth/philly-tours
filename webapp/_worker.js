const CANONICAL_HOST = "philly-tours.com";
const WWW_HOST = "www.philly-tours.com";
const GOOGLE_VERIFICATION_PATH = "/google938b918851605893.html";
const GOOGLE_VERIFICATION_BODY = "google-site-verification: google938b918851605893.html\n";
const INDEXNOW_KEY_PATH = "/48e8926a6fbf42c8143edb53ffb86436.txt";
const INDEXNOW_KEY_BODY = "48e8926a6fbf42c8143edb53ffb86436\n";
const VIDEO_ASSET_VERSION = "20260422214712";
const VIDEO_ASSET_PATHS = new Set([
  "/assets/video/philly-tours-product-hero.mp4",
  "/assets/video/philly-tours-product-reel.mp4"
]);

async function fetchAsset(request, env, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return env.ASSETS.fetch(new Request(url, request));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === WWW_HOST) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === GOOGLE_VERIFICATION_PATH) {
      return new Response(GOOGLE_VERIFICATION_BODY, {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, max-age=0, must-revalidate"
        }
      });
    }

    if (url.pathname === INDEXNOW_KEY_PATH) {
      return new Response(INDEXNOW_KEY_BODY, {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "public, max-age=0, must-revalidate"
        }
      });
    }

    if (VIDEO_ASSET_PATHS.has(url.pathname) && !url.search) {
      url.searchParams.set("v", VIDEO_ASSET_VERSION);
      return env.ASSETS.fetch(new Request(url, request));
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return env.ASSETS.fetch(request);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    if (!url.pathname.split("/").pop().includes(".")) {
      if (!url.pathname.endsWith("/")) {
        const htmlResponse = await fetchAsset(request, env, `${url.pathname}.html`);
        if (htmlResponse.status !== 404) {
          return htmlResponse;
        }
      }

      const indexPath = url.pathname.endsWith("/")
        ? `${url.pathname}index.html`
        : `${url.pathname}/index.html`;
      const indexResponse = await fetchAsset(request, env, indexPath);
      if (indexResponse.status !== 404) {
        return indexResponse;
      }
    }

    return fetchAsset(request, env, "/index.html");
  }
};
