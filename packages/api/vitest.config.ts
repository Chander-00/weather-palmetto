import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    setupFiles: './src/test/setup.ts'
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        target: 'es2021',
        parser: {
          syntax: 'typescript',
          decorators: true
        },
        transform: {
          decoratorMetadata: true,
          legacyDecorator: true
        }
      }
    })
  ]
})
