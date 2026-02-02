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
    .map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.excerpt ?? '',
      link: `/writing/${post.slug}/`,
    }));

  return rss({
    title: 'ntemposd.me',
    description: 'Thoughts on product, tech, and building things',
    site: context.site,
    items,
  });
}
