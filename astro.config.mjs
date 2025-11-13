// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ntemposd.me', // ✅ Use your custom domain (not GitHub Pages)
  base: '/',                   // root
  output: 'static',
  integrations: [
    tailwind(),
    sitemap(),                 // ✅ Adds automatic sitemap generation
  ],
});
