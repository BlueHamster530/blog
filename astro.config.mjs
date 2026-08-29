import { defineConfig } from 'astro/config';

// GitHub Pages: username.github.io/blog
export default defineConfig({
  site: 'https://BlueHamster530.github.io',
  base: '/blog',
  trailingSlash: 'ignore',
});
