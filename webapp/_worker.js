const SITE_ORIGIN = "https://philly-tours.com";
const SYNC_SERVER_URL = "https://api.philly-tours.com";
const BLOG_TITLE = "A Founder's Story";
const BLOG_DESCRIPTION =
  "Follow A Founder's Story with founder-life photos, videos, route notes, guided-tour updates, and Philadelphia walking-tour commentary.";
const DEFAULT_IMAGE = `${SITE_ORIGIN}/assets/search/philly-tours-search-thumbnail.jpg`;

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeXml(value) {
  return escapeHtml(value).replaceAll("'", "&apos;");
}

function escapeJsonForHtml(value) {
  return JSON.stringify(value, null, 2).replaceAll("</", "<\\/");
}

function absoluteUrl(pathname = "/") {
  if (/^https?:\/\//i.test(String(pathname || ""))) {
    return String(pathname);
  }
  const normalizedPath = String(pathname || "/").startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_ORIGIN}${normalizedPath}`;
}

function normalizePathname(pathname) {
  const decoded = decodeURIComponent(String(pathname || "/"));
  return decoded.endsWith("/") ? decoded : `${decoded}/`;
}

function formatIsoDate(value) {
  const normalized = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : new Date().toISOString().slice(0, 10);
}

function normalizePost(rawPost) {
  const title = String(rawPost?.title || "Founder story").trim();
  const slug = String(rawPost?.slug || "").trim();
  const bodyHtml = String(rawPost?.bodyHtml || "<p></p>").trim();
  const bodyText = String(rawPost?.bodyText || "").replace(/\s+/g, " ").trim();
  const excerpt = String(rawPost?.excerpt || bodyText.slice(0, 180) || title).trim();
  const publishedAt = formatIsoDate(rawPost?.publishedAt);
  const heroImage = String(rawPost?.heroImage || DEFAULT_IMAGE).trim();
  return {
    ...rawPost,
    title,
    slug,
    excerpt,
    publishedAt,
    bodyHtml,
    bodyText,
    heroImage,
    heroImageAlt: String(rawPost?.heroImageAlt || title).trim(),
    mediaCaption: String(rawPost?.mediaCaption || "").trim(),
    tags: Array.isArray(rawPost?.tags) ? rawPost.tags.map((tag) => String(tag).trim()).filter(Boolean) : []
  };
}

async function fetchFounderStoryPosts() {
  const response = await fetch(`${SYNC_SERVER_URL}/api/founder-story/posts`, {
    headers: {
      accept: "application/json"
    },
    cf: {
      cacheTtl: 60,
      cacheEverything: true
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.ok !== true || !Array.isArray(payload.posts)) {
    throw new Error(payload?.error || `Founder Story API returned ${response.status}`);
  }
  return payload.posts.map(normalizePost).filter((post) => post.slug);
}

async function fetchStaticBlogPosts(request, env) {
  const blogDataUrl = new URL("/blog-data.js", request.url);
  const response = await env.ASSETS.fetch(new Request(blogDataUrl.toString(), request));
  if (!response.ok) {
    return [];
  }
  const source = await response.text();
  const match = source.match(/window\.PHILLY_TOURS_BLOG\s*=\s*(\[[\s\S]*?\]);?\s*$/);
  if (!match) {
    return [];
  }
  try {
    const posts = JSON.parse(match[1]);
    return Array.isArray(posts) ? posts.map(normalizePost).filter((post) => post.slug) : [];
  } catch (error) {
    console.error("Static blog-data parse failed", error);
    return [];
  }
}

async function fetchMergedBlogPosts(request, env) {
  const [cmsPosts, staticPosts] = await Promise.all([
    fetchFounderStoryPosts().catch((error) => {
      console.error("Founder Story API fetch failed", error);
      return [];
    }),
    fetchStaticBlogPosts(request, env)
  ]);
  const postsBySlug = new Map();
  for (const post of staticPosts) {
    postsBySlug.set(post.slug, post);
  }
  for (const post of cmsPosts) {
    postsBySlug.set(post.slug, post);
  }
  return Array.from(postsBySlug.values()).sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
}

function renderHead({ title, description, canonicalPath, ogType = "website", image = DEFAULT_IMAGE, jsonLd = [] }) {
  const canonicalUrl = absoluteUrl(canonicalPath);
  return `    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#4b148c" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <meta name="author" content="Philly Tours" />
    <meta name="geo.region" content="US-PA" />
    <meta name="geo.placename" content="Philadelphia" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <link rel="alternate" type="application/rss+xml" title="Philly Tours Blog" href="/rss.xml" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png" />
    <meta property="og:site_name" content="Philly Tours" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="${escapeHtml(ogType)}" />
    <meta property="og:image" content="${escapeHtml(absoluteUrl(image))}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(absoluteUrl(image))}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/styles.css?v=20260420b" />
    <script type="application/ld+json">${escapeJsonForHtml({ "@context": "https://schema.org", "@graph": jsonLd })}</script>`;
}

function organizationSchema() {
  return {
    "@type": ["Organization", "TravelAgency"],
    "@id": absoluteUrl("/#organization"),
    "name": "Philly Tours",
    "url": absoluteUrl("/"),
    "logo": absoluteUrl("/assets/brand/site-icon-512.png"),
    "image": DEFAULT_IMAGE,
    "description":
      "Self-guided Philadelphia walking tours with audio narration, maps, Compass guidance, AR-ready stops, Black history, architecture, sports, and hidden city routes.",
    "areaServed": {
      "@type": "City",
      "name": "Philadelphia",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Philadelphia",
        "addressRegion": "PA",
        "addressCountry": "US"
      }
    }
  };
}

function renderShell({ title, description, canonicalPath, ogType, image, jsonLd, body, status = 200 }) {
  const html = `<!doctype html>
<html lang="en">
  <head>
${renderHead({ title, description, canonicalPath, ogType, image, jsonLd })}
  </head>
  <body class="seo-page">
${body}
  </body>
</html>`;
  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=60, s-maxage=60"
    }
  });
}

function renderBlogIndex(posts) {
  const cards = posts
    .map((post) => {
      const chips = post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
      const image = post.heroImage
        ? `<img class="seo-card__media" src="${escapeHtml(post.heroImage)}" alt="${escapeHtml(post.heroImageAlt)}" loading="lazy" />`
        : "";
      return `        <article class="seo-card">
          ${image}
          <p class="seo-meta">${escapeHtml(post.publishedAt)}</p>
          <h2><a href="/blog/${encodeURIComponent(post.slug)}/">${escapeHtml(post.title)}</a></h2>
          <p>${escapeHtml(post.excerpt)}</p>
          <div class="seo-chip-row">${chips}</div>
        </article>`;
    })
    .join("\n");

  return renderShell({
    title: `${BLOG_TITLE} | Philly Tours`,
    description: BLOG_DESCRIPTION,
    canonicalPath: "/blog/",
    jsonLd: [
      organizationSchema(),
      {
        "@type": "Blog",
        "@id": absoluteUrl("/blog/#blog"),
        "name": BLOG_TITLE,
        "url": absoluteUrl("/blog/"),
        "description": BLOG_DESCRIPTION,
        "publisher": { "@id": absoluteUrl("/#organization") },
        "blogPost": posts.map((post) => ({ "@id": absoluteUrl(`/blog/${post.slug}/#post`) }))
      }
    ],
    body: `    <main class="seo-shell">
      <a class="legal-back-link" href="/">Open Philly Tours</a>
      <header class="seo-hero">
        <p class="eyebrow">Philly Tours Blog</p>
        <h1>${escapeHtml(BLOG_TITLE)}</h1>
        <p>${escapeHtml(BLOG_DESCRIPTION)}</p>
      </header>
      <section class="seo-link-grid" aria-label="Blog posts">
${cards || "        <p>No published founder stories yet.</p>"}
      </section>
    </main>`
  });
}

function renderPostMedia(post) {
  if (!post.heroImage) {
    return "";
  }
  const caption = post.mediaCaption ? `<figcaption>${escapeHtml(post.mediaCaption)}</figcaption>` : "";
  return `        <figure class="founder-media-card">
          <img src="${escapeHtml(post.heroImage)}" alt="${escapeHtml(post.heroImageAlt)}" loading="lazy" />
          ${caption}
        </figure>`;
}

function renderSocialShareLinks(post) {
  const url = absoluteUrl(`/blog/${post.slug}/`);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(`${post.title} | ${BLOG_TITLE}`);
  const encodedText = encodeURIComponent(post.excerpt);
  return `        <aside class="seo-share" aria-label="Share this story">
          <h2>Share this story</h2>
          <ul>
            <li><a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}" target="_blank" rel="noopener noreferrer">X</a></li>
            <li><a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
            <li><a href="https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
            <li><a href="mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}">Email</a></li>
            <li><a href="${escapeHtml(url)}">Permalink</a></li>
          </ul>
        </aside>`;
}

function renderBlogPost(post) {
  const canonicalPath = `/blog/${post.slug}/`;
  return renderShell({
    title: `${post.title} | ${BLOG_TITLE}`,
    description: post.excerpt,
    canonicalPath,
    ogType: "article",
    image: post.heroImage,
    jsonLd: [
      organizationSchema(),
      {
        "@type": "BlogPosting",
        "@id": absoluteUrl(`${canonicalPath}#post`),
        "headline": post.title,
        "description": post.excerpt,
        "datePublished": post.publishedAt,
        "dateModified": post.publishedAt,
        "author": { "@id": absoluteUrl("/#organization") },
        "publisher": { "@id": absoluteUrl("/#organization") },
        "mainEntityOfPage": absoluteUrl(canonicalPath),
        "image": absoluteUrl(post.heroImage),
        "keywords": post.tags
      }
    ],
    body: `    <main class="seo-shell">
      <a class="legal-back-link" href="/blog/">All blog posts</a>
      <header class="seo-hero">
        <p class="eyebrow">${escapeHtml(BLOG_TITLE)}</p>
        <h1>${escapeHtml(post.title)}</h1>
        <p>${escapeHtml(post.excerpt)}</p>
      </header>
      <article class="seo-article blog-post-content">
        <p class="seo-meta">${escapeHtml(post.publishedAt)}</p>
${renderPostMedia(post)}
        ${post.bodyHtml}
${renderSocialShareLinks(post)}
        <p class="seo-action-row"><a class="primary-button" href="/#tab=blog&post=${encodeURIComponent(post.slug)}">Open in the webapp</a></p>
      </article>
    </main>`
  });
}

function renderRss(posts) {
  const lastBuildDate = posts[0]?.publishedAt
    ? new Date(`${posts[0].publishedAt}T12:00:00Z`).toUTCString()
    : new Date().toUTCString();
  const items = posts
    .map((post) => {
      const postUrl = absoluteUrl(`/blog/${encodeURIComponent(post.slug)}/`);
      const pubDate = post.publishedAt ? new Date(`${post.publishedAt}T12:00:00Z`).toUTCString() : lastBuildDate;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid>${escapeXml(postUrl)}</guid>
      <pubDate>${escapeXml(pubDate)}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Philly Tours Blog</title>
    <link>${escapeXml(absoluteUrl("/blog/"))}</link>
    <description>${escapeXml(BLOG_DESCRIPTION)}</description>
    <lastBuildDate>${escapeXml(lastBuildDate)}</lastBuildDate>
${items}
  </channel>
</rss>`;
  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=60, s-maxage=60"
    }
  });
}

async function renderSitemap(request, env, posts) {
  const assetResponse = await env.ASSETS.fetch(request);
  let xml = await assetResponse.text();
  if (!xml.includes("</urlset>")) {
    return assetResponse;
  }
  const dynamicUrls = posts
    .map((post) => {
      const loc = absoluteUrl(`/blog/${encodeURIComponent(post.slug)}/`);
      if (xml.includes(`<loc>${loc}</loc>`)) {
        return "";
      }
      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${escapeXml(post.publishedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .filter(Boolean)
    .join("\n");
  xml = xml.replace("</urlset>", `${dynamicUrls ? `${dynamicUrls}\n` : ""}</urlset>`);
  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=60, s-maxage=60"
    }
  });
}

async function handleBlogRequest(request, env, url) {
  const pathname = normalizePathname(url.pathname);
  const posts = await fetchMergedBlogPosts(request, env);
  if (pathname === "/blog/") {
    return renderBlogIndex(posts);
  }
  const match = pathname.match(/^\/blog\/([^/]+)\/$/);
  if (!match) {
    return env.ASSETS.fetch(request);
  }
  const slug = decodeURIComponent(match[1] || "");
  const post = posts.find((candidate) => candidate.slug === slug);
  if (post) {
    return renderBlogPost(post);
  }
  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname.toLowerCase() === "www.philly-tours.com") {
      url.hostname = "philly-tours.com";
      return Response.redirect(url.toString(), 301);
    }

    try {
      if (normalizePathname(url.pathname).startsWith("/blog/")) {
        return await handleBlogRequest(request, env, url);
      }
      if (url.pathname === "/rss.xml") {
        return renderRss(await fetchMergedBlogPosts(request, env));
      }
      if (url.pathname === "/sitemap.xml") {
        return renderSitemap(request, env, await fetchMergedBlogPosts(request, env));
      }
    } catch (error) {
      console.error("Dynamic Founder Story render failed", error);
    }

    return env.ASSETS.fetch(request);
  }
};
