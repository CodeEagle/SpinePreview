// /Users/lincoln/Develop/GitHub/spine_preview/vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './spinePreview.js',
      name: 'SpinePreview',
      fileName: 'spine-preview',
      formats: ['iife']   // 也可加 'umd'
    },
    rollupOptions: {
      // 确保没有把依赖裁出去
      external: [],
      output: { globals: {} }
    },
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false
  }
})