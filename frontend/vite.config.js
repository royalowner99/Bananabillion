import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  plugins: [],
})
