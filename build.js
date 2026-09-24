const esbuild = require('esbuild');
const fs = require('fs');

const watch = process.argv.includes('--watch');

async function buildUI() {
  const jsResult = await esbuild.build({
    entryPoints: ['src/ui/index.tsx'],
    bundle: true,
    write: false,
    target: 'es2020',
    jsx: 'automatic',
    jsxImportSource: 'preact',
  });

  const cssResult = await esbuild.build({
    entryPoints: ['src/ui/styles.css'],
    bundle: true,
    write: false,
    loader: { '.woff2': 'dataurl', '.woff': 'dataurl' },
  });

  const js = jsResult.outputFiles[0].text;
  const css = cssResult.outputFiles[0].text;

  const template = fs.readFileSync('src/ui/index.html', 'utf8');
  const html = template
    .replace('<!-- inject:css -->', `<style>${css}</style>`)
    .replace('<!-- inject:js -->', `<script>${js}</script>`);

  fs.writeFileSync('ui.html', html);
  console.log('[ui] built');
}

async function build() {
  if (watch) {
    const ctx = await esbuild.context({
      entryPoints: ['src/plugin/index.ts'],
      bundle: true,
      outfile: 'code.js',
      target: 'es2020',
      plugins: [{
        name: 'rebuild-ui',
        setup(build) {
          build.onEnd(result => {
            if (result.errors.length === 0) {
              buildUI().catch(e => console.error('[ui] build error:', e.message));
              console.log('[plugin] rebuilt');
            } else {
              console.error('[plugin] build failed');
            }
          });
        },
      }],
    });

    await ctx.watch();
    await buildUI();
    console.log('Watching for changes…');

    // Watch src/ui/ files (HTML, CSS, TS) — esbuild only tracks plugin imports
    let uiDebounce = null;
    fs.watch('src/ui', { recursive: true }, () => {
      clearTimeout(uiDebounce);
      uiDebounce = setTimeout(() => {
        buildUI().catch(e => console.error('[ui] build error:', e.message));
      }, 50);
    });
  } else {
    await esbuild.build({
      entryPoints: ['src/plugin/index.ts'],
      bundle: true,
      outfile: 'code.js',
      target: 'es2020',
    });
    console.log('[plugin] built');
    await buildUI();
  }
}

build().catch(e => { console.error(e); process.exit(1); });
