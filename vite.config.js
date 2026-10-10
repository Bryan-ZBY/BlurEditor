import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

function singleFileBuild() {
  return {
    name: 'single-file-build',
    apply: 'build',
    enforce: 'post',
    // Run after Vite has finalized the dynamic-import preload helpers.
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const html = bundle['index.html'];
        if (!html || html.type !== 'asset') this.error('Missing index.html');

        const getAsset = (url) => {
          const file = bundle[url.replace(/^\.\//, '')];
          if (!file) this.error(`Cannot inline asset: ${url}`);
          return file;
        };

        // Use one pass so HTML templates inside the JavaScript are left intact.
        html.source = String(html.source).replace(
          /<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>|<link\b(?=[^>]*\brel="(stylesheet|icon)")[^>]*\bhref="([^"]+)"[^>]*>/g,
          (tag, scriptUrl, rel, assetUrl) => {
            if (assetUrl?.startsWith('data:')) return tag;
            const file = getAsset(scriptUrl || assetUrl);
            if (scriptUrl) {
              if (file.type !== 'chunk' || file.imports.length || file.dynamicImports.length) {
                this.error(`JavaScript still has external dependencies: ${scriptUrl}`);
              }
              delete bundle[file.fileName];
              return `<script type="module">${file.code.replace(/<\/script/gi, '<\\/script')}</script>`;
            }
            if (file.type !== 'asset') this.error(`Expected an asset: ${assetUrl}`);
            delete bundle[file.fileName];
            if (rel === 'icon') {
              const mime = tag.match(/\btype="([^"]+)"/)?.[1] || 'image/x-icon';
              return tag.replace(assetUrl, `data:${mime};base64,${Buffer.from(file.source).toString('base64')}`);
            }
            return `<style>${String(file.source).replace(/<\/style/gi, '<\\/style')}</style>`;
          }
        );

        const remaining = Object.keys(bundle).filter((name) => name !== 'index.html');
        if (remaining.length) this.error(`Assets were not inlined: ${remaining.join(', ')}`);
      }
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [vue(), singleFileBuild()],
  server: {
    port: 3000,
    open: true,
    historyApiFallback: true
  },
  build: {
    // Embed images/fonts and merge Mermaid's lazy-loaded diagrams for file:// use.
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    cssCodeSplit: false,
    modulePreload: false,
    copyPublicDir: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});
