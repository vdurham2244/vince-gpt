import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    base: '/vince-app/',
    server: {
        port: 5173,
        open: true
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    'three': ['three'],
                    'vendor': ['three/examples/jsm/loaders/GLTFLoader.js', 
                              'three/examples/jsm/loaders/DRACOLoader.js',
                              'three/examples/jsm/controls/OrbitControls.js']
                }
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    publicDir: 'public'
}); 