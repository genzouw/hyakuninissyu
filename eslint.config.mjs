import neostandard from 'neostandard';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import globals from 'globals';
import pluginSecurity from 'eslint-plugin-security';
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility';
import pluginRegexp from 'eslint-plugin-regexp';

export default [
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

  pluginSecurity.configs.recommended,
  pluginRegexp.configs['flat/recommended'],
  ...pluginVue.configs['flat/essential'],
  ...pluginVueA11y.configs['flat/recommended'],

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
      'vuejs-accessibility/label-has-for': 'warn',
      'vuejs-accessibility/click-events-have-key-events': 'warn',
      'vuejs-accessibility/no-static-element-interactions': 'warn',
      'vuejs-accessibility/media-has-caption': 'warn',
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
