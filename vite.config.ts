import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Tách vendor libraries lớn
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'ui-vendor': ['lucide-react'],
          'form-vendor': ['react-hook-form'],
        },
      },
    },
    // Tăng chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Optimize with esbuild (faster than terser)
    sourcemap: false,
    minify: 'esbuild',
  },
});
