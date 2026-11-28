import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { interfaceCatalogs } from './build-tools/interfaceCatalogs';

const EXCALIDRAW_PRODUCTION_PATH = '/node_modules/@excalidraw/excalidraw/dist/prod/';

export default defineConfig({
  plugins: [interfaceCatalogs(), react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id, { getModuleInfo }) {
          const directoryIndex = id.indexOf(EXCALIDRAW_PRODUCTION_PATH);
          if (directoryIndex === -1) return;
          const directory = id.slice(0, directoryIndex + EXCALIDRAW_PRODUCTION_PATH.length);
          const worker = getModuleInfo(directory + 'subset-worker.chunk.js');
          if (!worker?.importedIds.includes(id)) return;

          // Excalidraw 0.18.1 shares helpers between the SVG font worker and renderer.
          // Keep them separate so the worker never pulls in the browser entry, which uses document.
          const usedByRenderer = getModuleInfo(id)?.importers.some(
            (importer) =>
              importer.startsWith(directory) && !importer.startsWith(directory + 'subset-')
          );
          if (usedByRenderer) return 'excalidraw-worker-runtime';
        },
      },
    },
  },
  // "@/shared/lib/storage" is src/shared/lib/storage: imports between FSD slices use it
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
