import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/',
  assetsInclude: ['**/*.mp3'], 
  server: {
    host: '0.0.0.0',  // Makes the app accessible from your local network
    port: 3000,        // Change to your desired port
  },
})
