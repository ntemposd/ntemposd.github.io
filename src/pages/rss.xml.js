import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts');
  const EXCERPT_MAX_CHARS = 220;

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
  const toFixedChars = (text, maxChars) => {
    if (typeof text !== 'string' || text.length === 0) return '';
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (cleaned.length <= maxChars) return cleaned;
    const slice = cleaned.slice(0, maxChars);
    const lastSpace = slice.lastIndexOf(' ');
    const clipped = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
    return `${clipped}...`;
  };
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

      const fixedExcerpt = toFixedChars(post.data.excerpt ?? '', EXCERPT_MAX_CHARS);
      const safeExcerpt = escapeHtml(fixedExcerpt);
      const contentHtml =
        (safeExcerpt ? `<p>${safeExcerpt}</p>` : '') +
        `<p><a href="${absoluteLink}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Read more</a></p>`;

      return {
        title: post.data.title,
        pubDate: new Date(post.data.date),
        // Keep card/list previews deterministic: plain text, fixed length.
        description: fixedExcerpt,
        // Keep post body formatting separate from preview text.
        content: contentHtml,
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
