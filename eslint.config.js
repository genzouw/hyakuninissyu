'use strict';

const neostandard = require('neostandard');
const pluginVue = require('eslint-plugin-vue');
const vueParser = require('vue-eslint-parser');
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

  ...pluginVue.configs['flat/essential'],

  {
    files: ['**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: vueParser,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@stylistic/generator-star-spacing': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      complexity: ['error', { max: 10 }],
      'vue/multi-word-component-names': 'off',
    },
  },

  {
    files: ['test/**/*.{js,vue}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
