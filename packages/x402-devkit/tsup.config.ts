import { defineConfig } from 'tsup'

export default defineConfig([
  // Server bundle
  {
    entry: { 'server/index': 'src/server/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'node18',
    splitting: false,
  },
  // Client bundle
  {
    entry: { 'client/index': 'src/client/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    target: 'es2020',
    splitting: false,
  },
  // Client React bundle
  {
    entry: { 'client/react': 'src/client/react.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    target: 'es2020',
    splitting: false,
    external: ['react', 'react-dom'],
  },
])
