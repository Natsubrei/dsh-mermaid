/**
 * Build the two client artifacts the DeepSeek Harness module loader consumes:
 * `client.js` (the plugin factory) and `client.mermaid.js` (the diagram engine,
 * requested as a local chunk on first use).
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { build } from 'esbuild'

const root = new URL('.', import.meta.url)
const require = createRequire(import.meta.url)
const PKG = JSON.parse(await readFile(new URL('package.json', root), 'utf8')).name
if (typeof PKG !== 'string' || PKG === '') {
  throw new Error('build: package.json is missing a name')
}

const result = await build({
  entryPoints: [fileURLToPath(new URL('src/client.jsx', root))],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  jsx: 'automatic',
  external: ['react', 'react/jsx-runtime', 'react-dom'],
  logLevel: 'info',
})
const bundle = result.outputFiles[0].text

const client = [
  'window.__ModuleLoader__.load({',
  `  id: ${JSON.stringify(PKG)},`,
  '  factory(require) {',
  '    const module = { exports: {} };',
  '    (function (module, exports, require) {',
  bundle,
  '    })(module, module.exports, require);',
  '    const plugin = module.exports;',
  '    return { inject: plugin.inject, apply: (ctx) => plugin.apply(ctx, require) };',
  '  },',
  '});',
  '',
].join('\n')
await writeFile(new URL('client.js', root), client)

/**
 * The engine's distribution publishes itself at script top level: its build
 * declares a `var` that only becomes a global in a classic script's global
 * scope, so the source must not be wrapped in the registration factory. It
 * runs first, then the factory hands the global to the module table.
 */
const engine = await readFile(require.resolve('mermaid/dist/mermaid.min.js'), 'utf8')
const chunk = [
  engine,
  '',
  'window.__ModuleLoader__.load({',
  `  id: ${JSON.stringify(`${PKG}/client.mermaid.js`)},`,
  '  factory() {',
  '    return { default: globalThis.mermaid };',
  '  },',
  '});',
  '',
].join('\n')
await writeFile(new URL('client.mermaid.js', root), chunk)

console.log('built client.js and client.mermaid.js')
