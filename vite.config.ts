import { defineConfig, loadEnv } from "vite";
import laravel from "laravel-vite-plugin";
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load environment variables from .env file
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
        plugins: [
            laravel({
                input: ["resources/css/app.css", "resources/js/app.tsx"],
                refresh: true,
            }),
            react(),
        ],
        define: {
            'process.env.APP_NAME': JSON.stringify(env.APP_NAME || 'Laravel Inertia App'),
            'process.env.BRAND_NAME': JSON.stringify(env.BRAND_NAME || 'Laravel'),
        },
        resolve: {  
            alias: {
                "@assets": "resources/",
                "@": "resources/js/",
            }
        }
    };
});