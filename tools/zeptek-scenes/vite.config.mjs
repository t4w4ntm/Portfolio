import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(new URL('.', import.meta.url))
const ZP = '/Users/wan/Desktop/zeptekkkk'
const OUT = '/Users/wan/Desktop/Portfolio-main/vendor'

// Zeptek loads models from the site root (/models/x.glb); the portfolio serves them next to index.html.
const relativeModels = {
  name: 'relative-models',
  transform(code, id) {
    if (!id.startsWith(ZP + '/src')) return null
    return code.replace(/(['"`])\/models\//g, '$1models/')
  },
}

export default defineConfig({
  root: here,
  plugins: [react(), relativeModels],
  resolve: {
    alias: [
      { find: /^.*\/i18n\/I18nProvider$/, replacement: here + 'i18n-stub.tsx' },
      { find: '@zp', replacement: ZP + '/src' },
    ],
  },
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    outDir: OUT,
    emptyOutDir: false,
    minify: true,
    sourcemap: false,
    lib: { entry: here + 'entry.tsx', formats: ['es'], fileName: () => 'zeptek-scenes.js' },
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
})
