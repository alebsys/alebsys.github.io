// @ts-check
import { defineConfig } from 'astro/config';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const publicDir = fileURLToPath(new URL('./public', import.meta.url));

// Dev-only: serve public/<dir>/index.html for directory URLs,
// matching GitHub Pages behavior for the legacy static archive.
const publicDirIndex = {
  name: 'public-dir-index',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const url = (req.url ?? '').split('?')[0];
      if (url.endsWith('/') && existsSync(path.join(publicDir, url, 'index.html'))) {
        req.url = url + 'index.html';
      }
      next();
    });
  },
};

// https://astro.build/config
export default defineConfig({
  site: 'https://alebsys.github.io',
  vite: {
    plugins: [publicDirIndex],
  },
});
