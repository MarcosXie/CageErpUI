import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills' // <--- Importe aqui

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({ // <--- Adicione aqui
        // Isso garante que 'process', 'Buffer', etc. existam no navegador
        include: ['process', 'buffer', 'util', 'stream'],
        globals: {
            Buffer: true,
            global: true,
            process: true,
        },
    }),
  ],
  // Às vezes também é necessário definir o global manualmente para algumas libs antigas
  define: {
    global: 'window', 
  },
})