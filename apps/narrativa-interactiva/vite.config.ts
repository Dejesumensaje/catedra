import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

// La bitácora se compila como sitio estático dentro de `public/` del sitio Astro.
// Cloudflare Pages solo corre `astro build`: la salida se commitea.
export default defineConfig({
  base: '/narrativa-interactiva/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../../public/narrativa-interactiva',
    emptyOutDir: true,
  },
});
