import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts');
  const CARD_EXCERPT_MAX_CHARS = 120;

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
  const feedUrl = toAbsolute(context.url.pathname);
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
  // Substack cards often stop at ASCII sentence stops (., !, ?).
  // Keep text readable by swapping sentence stops to a neutral separator
  // only for the card preview field.
  const toSubstackCardPreview = (text) =>
    String(text)
      .replace(/\s*[.!?]+\s+/g, ' | ')
      .replace(/\s+/g, ' ')
      .trim();
  const extractFirstHeading = (markdown) => {
    if (typeof markdown !== 'string' || markdown.length === 0) return '';
    const lines = markdown.split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      if (/^#{1,6}\s+/.test(line)) {
        return line.replace(/^#{1,6}\s+/, '').replace(/\*\*/g, '').trim();
      }
    }
    return '';
  };
  const extractFirstParagraph = (markdown) => {
    if (typeof markdown !== 'string' || markdown.length === 0) return '';
    const lines = markdown.split('\n');
    const paragraphLines = [];
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        if (paragraphLines.length > 0) break;
        continue;
      }
      // Skip common non-paragraph markdown blocks at the top.
      if (/^#{1,6}\s/.test(line)) continue;
      if (/^!\[.*\]\(.*\)/.test(line)) continue;
      if (/^>\s?/.test(line)) continue;
      if (/^(-|\*|\+)\s/.test(line)) continue;
      if (/^\d+\.\s/.test(line)) continue;
      paragraphLines.push(line);
    }
    return paragraphLines.join(' ').replace(/\s+/g, ' ').trim();
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

      const absoluteLink = toAbsolute(`/essays/${post.slug}/`);

      const fullExcerpt = String(post.data.excerpt ?? '').replace(/\s+/g, ' ').trim();
      const fixedExcerpt = toFixedChars(fullExcerpt, CARD_EXCERPT_MAX_CHARS);
      const cardExcerpt = toSubstackCardPreview(fixedExcerpt);
      const firstTitle = extractFirstHeading(post.body ?? '');
      const firstParagraph = extractFirstParagraph(post.body ?? '');
      const safeExcerpt = escapeHtml(fullExcerpt || fixedExcerpt);
      const safeTitle = escapeHtml(firstTitle);
      const safeParagraph = escapeHtml(firstParagraph);
      const contentHtmlParts = [
        safeExcerpt ? `<p>${safeExcerpt}</p>` : '',
        safeTitle ? `<h2>${safeTitle}</h2>` : '',
        safeParagraph ? `<p>${safeParagraph}</p>` : '',
        `<p><a href="${absoluteLink}">Read more</a></p>`,
      ];
      const contentHtml = contentHtmlParts.filter(Boolean).join('');

      return {
        title: post.data.title,
        pubDate: new Date(post.data.date),
        // Keep card/list previews deterministic: plain text, fixed length.
        description: cardExcerpt,
        // Keep post body formatting separate from preview text.
        content: contentHtml,
        link: absoluteLink,
      };
    });

  return rss({
    title: 'ntemposd.me',
    description: 'Thoughts on product, tech, and building things',
    site: context.site,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
    },
    customData: `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`,
    items,
  });
}

