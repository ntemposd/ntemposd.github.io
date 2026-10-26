import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte,md,mdx}', // ⬅️ required
  ],
  darkMode: 'class', // ⬅️ you're already using this correctly
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            blockquote: {
              fontWeight: '400',
              fontStyle: 'normal',
              quotes: 'none',
            },
            'blockquote p:first-of-type::before': {
              content: 'none',
            },
            'blockquote p:last-of-type::after': {
              content: 'none',
            },
          },
        },
      },
    },
  },
  plugins: [
    typography, // ⬅️ this loads @tailwindcss/typography correctly
  ],
};

export default config;
