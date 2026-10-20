import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({base:'./',optimizeDeps:{include:['firebase/app','firebase/auth','firebase/firestore']},plugins:[react(),tailwindcss()],server:{host:'0.0.0.0'}});
