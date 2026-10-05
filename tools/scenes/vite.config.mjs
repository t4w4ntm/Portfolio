import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(new URL('.', import.meta.url))
// SCENES_SRC: path to the web app whose src/ holds the scene components.
const SRC = process.env.SCENES_SRC
if (!SRC) throw new Error('Set SCENES_SRC to the folder that contains src/components/three')
const OUT = fileURLToPath(new URL('../../vendor', import.meta.url))

// The source app loads models from the site root (/models/x.glb); the portfolio serves them next to index.html.
const relativeModels = {
  name: 'relative-models',
  transform(code, id) {
    if (!id.startsWith(SRC + '/src')) return null
    return code.replace(/(['"`])\/models\//g, '$1models/')
  },
}

export default defineConfig({
  root: here,
  plugins: [react(), relativeModels],
  resolve: {
    alias: [
      { find: /^.*\/i18n\/I18nProvider$/, replacement: here + 'i18n-stub.tsx' },
      { find: '@src', replacement: SRC + '/src' },
    ],
  },
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    outDir: OUT,
    emptyOutDir: false,
    minify: true,
    sourcemap: false,
    lib: { entry: here + 'entry.tsx', formats: ['es'], fileName: () => 'scenes.js' },
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
})
