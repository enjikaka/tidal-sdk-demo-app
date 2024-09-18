import * as esbuild from 'esbuild';
import { writeFile } from 'fs/promises';
import { clean } from 'esbuild-plugin-clean';
import postcss from 'esbuild-postcss';

// Create a context for incremental builds
const buildText = '🔨 Building with esbuild';

const entryPoints = [
  'app/src/*.js',
  'app/src/main.css',
];

console.debug(buildText + '...');
console.time(buildText);
const context = await esbuild.context({
  entryPoints,
  entryNames: '[dir]/[name]-[hash]',
  bundle: true,
  outdir: 'dist',
  splitting: true,
  minify: true,
  sourcemap: true,
  mainFields: ['main'],
  target: 'es2023',
  platform: 'browser',
  format: 'esm',
  metafile: true,
  define: {
    // @ts-ignore
    'process.env.API_CLIENT_ID': `'${process.env.API_CLIENT_ID}'`,
    'process.env.API_CLIENT_SECRET': `'${process.env.API_CLIENT_SECRET}'`,
    'process.env.API_REDIRECT_URL': `'${process.env.API_REDIRECT_URL}'`,
  },
  plugins: [
    clean({
      patterns: ['dist']
    }),
    postcss()
  ]
});

// Manually do an incremental build
const result = await context.rebuild();

if (result.metafile) {
  // https://bundle-buddy.com/esbuild
  await writeFile('./metafile.json', JSON.stringify(result.metafile));

  const hashTable = ['app/src/app.js', 'app/src/main.css'].reduce((obj, entryPoint) => {
    const outputs = result.metafile.outputs;

    if (outputs) {
      const value = Object.entries(outputs).find(([key, value]) => value.entryPoint === entryPoint);

      if (value) {
        obj[entryPoint.split('src/')[1]] = value[0].split('dist/')[1];
      }
    }

    return obj;
  }, {});

  await writeFile('./dist/hash-table.json', JSON.stringify(hashTable));
}

console.timeEnd(buildText);
context.dispose();
