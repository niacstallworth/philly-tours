# Historical Current Events Blog Framework

This framework turns people and places already present in the Philly Tours route database into educational blog posts that connect American history to present-day civic life.

Starting May 17, 2026, every new blog post should also receive a generated semantic hero image before publishing. The image is part of the content package, not an optional decoration.

## Editorial Scope

- Use only American history as the historical foundation.
- Source each post from people, places, or movements already present in `src/data/tours.ts`, `docs/ar-briefs/`, or production narration scripts.
- Keep the historical person or place as the fore-story, then bridge into the current event, policy question, or political issue.
- Avoid European history and Jewish history as standalone blog topics. If a brief mention is required for American historical accuracy, keep it narrow, sourced, and secondary to the American-history frame.
- Do not publish unsourced claims about current events or politics. Current material should be checked against reliable, recent sources before posting.

## Post Shape

1. Historical opening: a person or place from the route database.
2. Civic bridge: the public issue that connects past and present.
3. Current context: recent policy, law, court, election, education, public-health, housing, labor, or local-government development.
4. Reader takeaway: what the historical example teaches about public life now.
5. Route connection: point readers back to the relevant Philly Tours stop or route.

## Recommended Topics

- Cecil B. Moore: voting rights, representation, policing, public schools, protest, political independence.
- Richard Allen, Absalom Jones, and the Free African Society: mutual aid, public health, Black institution-building.
- W.E.B. Du Bois and *The Philadelphia Negro*: housing, data, public policy, urban inequality.
- Dr. Charles Drew: blood supply, medical access, health equity, scientific credit.
- Barbara Bates Center and Mercy-Douglass: nursing, hospital access, Black medical education.
- Garrett Morgan: public safety, infrastructure, transportation policy.
- Lewis Latimer: invention, energy, patents, technology access.
- Marian Anderson: culture, civil rights, public institutions.
- John Coltrane: arts funding, neighborhood memory, cultural preservation.
- Joe Frazier, Sonny Hill, Allen Iverson: sports, public recreation, youth opportunity, civic identity.

## Working Standard

Each finished post should include:

- `title`
- `publishedAt`
- `excerpt`
- `tags`
- `heroImage`
- `heroImageAlt`
- 700-1,100 words
- at least 2 source links for current context
- a clear route/database connection
- no invented quotes
- no generic culture-war framing

## Blog Image Standard

Use the same logic that produced the May 17, 2026 blog image set: generate a social-first image from the post title, slug, excerpt, tags, and route connection. Treat the slug like a semantic prompt, the way Meta's composer inferred a strong image from a readable blog URL.

Images should be:

- 1:1 square source artwork, exported into `webapp/assets/blog/` as a 1200x1200 JPG.
- Named after the post subject or slug, for example `du-bois-philadelphia-negro-evictions-right-to-counsel.jpg`.
- Referenced from Markdown frontmatter with `/assets/blog/<filename>.jpg`.
- Paired with a useful `heroImageAlt` sentence.
- Used by the static blog page, the app blog cards, JSON-LD, `og:image`, and `twitter:image` through the existing build pipeline.

Default prompt direction:

```text
Use case: historical-scene
Asset type: square social/blog hero image for a Facebook post and blog preview
Primary request: Create a richly layered editorial collage image inspired by the article title: "<title>".
Scene/backdrop: <Philadelphia place, route stop, civic issue, current-policy bridge>.
Subject: <historical person, institution, or community scene> integrated with Philadelphia civic-history imagery.
Style: sophisticated mixed-media collage, watercolor washes, graphite or archival portrait texture, archival paper, restrained civic color, visually strong at mobile feed size.
Composition: square 1:1 image, strong central subject, layered Philadelphia architecture/maps/documents around it.
Constraints: no text, no captions, no logo, no watermark, no fake signatures, no modern UI elements, no sensationalism; keep it respectful, historically grounded, and editorial.
```

After generating, inspect the image before using it. Reject images with embedded fake text, distorted faces/hands, wrong historical tone, sensational imagery, or subject matter that conflicts with the article.

When a post uses a generated image:

1. Save the image under `webapp/assets/blog/`.
2. Add `heroImage` and `heroImageAlt` to the post frontmatter.
3. Run `npm run webapp:data` or `npm run webapp:build`.
4. Verify the generated static post contains the same image in `og:image`, `twitter:image`, visible article media, and the BlogPosting `image` field.
