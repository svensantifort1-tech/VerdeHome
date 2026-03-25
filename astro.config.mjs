// astro.config.mjs
// Fyxo Performance Standard: Server-first output, Edge-ready.
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  integrations: [tailwind()],
  output: 'server',
  adapter: cloudflare({
    imageService: 'cloudflare', // Offloads image optimization to Cloudflare's Edge
  }),
});
