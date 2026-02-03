import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts');

  const items = posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => {
      const da = new Date(a.data.date);
      const db = new Date(b.data.date);
      return db.getTime() - da.getTime();
    })
    .map((post) => {
      const rawImage = post.data.image;
      const imageUrl =
        typeof rawImage === 'string' && rawImage.length > 0
          ? new URL(rawImage, context.site).toString()
          : null;

      const ext = typeof rawImage === 'string' ? rawImage.split('.').pop()?.toLowerCase() : null;
      const type =
        ext === 'png' ? 'image/png'
        : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
        : ext === 'gif' ? 'image/gif'
        : ext === 'webp' ? 'image/webp'
        : ext === 'avif' ? 'image/avif'
        : ext === 'svg' ? 'image/svg+xml'
        : null;

      return {
        title: post.data.title,
        pubDate: new Date(post.data.date),
        description: post.data.excerpt ?? '',
        link: `/writing/${post.slug}/`,
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
    items,
  });
}
