import path from "path" // <-- 1. TAMBAHKAN BARIS INI
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: { // <-- 2. TAMBAHKAN BLOK INI
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: { // <-- TAMBAHKAN BLOK INI
    host: true, // Agar bisa diakses dari luar localhost

    allowedHosts: ['.ngrok-free.app'] 
  }
})
