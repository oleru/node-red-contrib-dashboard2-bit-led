import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
    plugins: [vue(), cssInjectedByJsPlugin()],
    build: {
        outDir: 'resources',
        lib: { entry: 'ui/index.js', name: 'ui-bit-led', formats: ['umd'], fileName: () => 'ui-bit-led.umd.js' },
        commonjsOptions: { include: [/lib/, /node_modules/] },
        rollupOptions: { external: ['vue'], output: { globals: { vue: 'Vue' } } }
    }
})
