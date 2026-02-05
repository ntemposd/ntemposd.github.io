import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts');

  const assetUrls = import.meta.glob('../../assets/posts/**/*.{png,jpg,jpeg,webp,avif,svg}', {
    eager: true,
    query: '?url',
    import: 'default',
  });

  const base = (p) => p.split('/').pop().replace(/\.[^.]+$/, '').toLowerCase();
  const assetMap = new Map(
    Object.entries(assetUrls).map(([k, url]) => [base(k), url])
  );

  const toAbsolute = (url) => new URL(url, context.site).toString();
  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  const resolveImageUrl = (raw) => {
    if (typeof raw !== 'string' || raw.length === 0) return null;
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    const hit = assetMap.get(base(raw));
    if (hit) return toAbsolute(hit);
    return toAbsolute(raw);
  };

  const items = posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => {
      const da = new Date(a.data.date);
      const db = new Date(b.data.date);
      return db.getTime() - da.getTime();
    })
    .map((post) => {
      const rawImage = post.data.image ?? post.data.cover ?? null;
      const imageUrl = resolveImageUrl(rawImage);

      const ext = typeof rawImage === 'string' ? rawImage.split('.').pop()?.toLowerCase() : null;
      const type =
        ext === 'png' ? 'image/png'
        : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
        : ext === 'gif' ? 'image/gif'
        : ext === 'webp' ? 'image/webp'
        : ext === 'avif' ? 'image/avif'
        : ext === 'svg' ? 'image/svg+xml'
        : null;

      const absoluteLink = toAbsolute(`/writing/${post.slug}/`);

      const mediaType = type ?? 'image/jpeg';
      const mediaCustomData = imageUrl
        ? `<media:content url="${imageUrl}" medium="image" type="${mediaType}" />` +
          `<media:thumbnail url="${imageUrl}" />`
        : '';

      const safeTitle = escapeHtml(post.data.title);
      const safeExcerpt = escapeHtml(post.data.excerpt ?? '');
      const descriptionHtml =
        (imageUrl ? `<p><img src="${imageUrl}" alt="${safeTitle}" /></p>` : '') +
        (safeExcerpt ? `<p>${safeExcerpt}</p>` : '') +
        `<p><a href="${absoluteLink}">Read on ntemposd.me</a></p>`;

      return {
        title: post.data.title,
        pubDate: new Date(post.data.date),
        description: descriptionHtml,
        link: absoluteLink,
        customData: mediaCustomData,
        enclosure:
          imageUrl && type
            ? {
                url: imageUrl,
                length: 0,
                type,
              }
            : undefined,
      };
    });

  return rss({
    title: 'ntemposd.me',
    description: 'Thoughts on product, tech, and building things',
    site: context.site,
    xmlns: {
      media: 'http://search.yahoo.com/mrss/',
    },
    items,
  });
}
