import { resolve, dirname } from 'path'

export default {
  build: {
    lib: {
      entry: resolve(dirname(new URL(import.meta.url).pathname), 'vanilla.mjs'),
      name: 'unihead',
      fileName: (format) => `unihead.${format}.js`,
    },
  },
}
