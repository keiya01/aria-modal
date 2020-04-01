import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
  input: './src/index.ts',
  output: [
    {
      file: pkg['module'],
      format: 'es'
    },
    {
      file: pkg['main'],
      format: 'umd',
      name: 'AriaModalElement',
      plugins: [
        process.env.NODE_ENV === 'production'
        && terser()
      ]
    }
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json'
    })
  ]
}