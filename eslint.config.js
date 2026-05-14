'use strict';

const neostandard = require('neostandard');
const pluginVue = require('eslint-plugin-vue');
const vueParser = require('vue-eslint-parser');
const babelParser = require('@babel/eslint-parser');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      'build/**',
      'config/**',
      'dist/**',
      '*.js',
      'test/unit/coverage/**',
    ],
  },

  ...neostandard(),

  ...pluginVue.configs['flat/vue2-essential'],

  {
    files: ['**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: vueParser,
      parserOptions: {
        parser: babelParser,
        requireConfigFile: false,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'generator-star-spacing': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      complexity: ['error', { max: 10 }],
      'vue/multi-word-component-names': 'off',
    },
  },
];
