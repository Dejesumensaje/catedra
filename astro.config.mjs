// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://catedra.dejesumensaje.com',
  integrations: [
    mdx(),
    sitemap({
      // Las páginas de uso interno de una clase —formularios que se llenan en
      // el salón, tableros que se proyectan— no son material publicado y no
      // van al sitemap. Llevan además `noindex` y una regla en robots.txt.
      filter: (pagina) => !pagina.includes('/bitacora'),
    }),
  ],
});