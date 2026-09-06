import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0', // Expose dev server to container network
    port: 5173,
    watch: {
      usePolling: true, // Required for file change detection inside Docker volumes
    },
    allowedHosts: ['web-financehub.asik.local'], // Allow access from host machine
  },
});