import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // "@/shared/lib/storage" is src/shared/lib/storage: imports between FSD slices use it
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
