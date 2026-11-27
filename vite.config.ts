import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { interfaceCatalogs } from './build-tools/interfaceCatalogs';

export default defineConfig({
  plugins: [interfaceCatalogs(), react()],
  // "@/shared/lib/storage" is src/shared/lib/storage: imports between FSD slices use it
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
