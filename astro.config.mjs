// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { rehypeLazyContentImages } from './src/lib/rehype-lazy-content-images.mjs';

export default defineConfig({
  site: 'https://ntemposd.me', // ✅ Use your custom domain (not GitHub Pages)
  base: '/', // root
  output: 'static',
  trailingSlash: 'always',
  markdown: {
    rehypePlugins: [rehypeLazyContentImages],
  },
  integrations: [
    tailwind(),
    sitemap({
      // Legacy /writing/ pages are redirects. Keep them out of the sitemap.
      filter: (page) => {
        const { pathname } = new URL(page);
        return pathname !== '/writing' && !pathname.startsWith('/writing/');
      },
    }),
  ],
});
