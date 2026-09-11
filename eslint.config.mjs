import neostandard from 'neostandard'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'
import pluginSecurity from 'eslint-plugin-security'
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility'
import pluginRegexp from 'eslint-plugin-regexp'

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
  ...pluginVue.configs['flat/recommended'],
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
      // このプロジェクトでは Bootstrap 形式の `<label for="x">` + `<Field id="x">` を
      // 兄弟要素として配置するフォームパターンを採用しており、label の子要素として
      // コントロールをネストしない。デフォルトの required（nesting かつ id）では
      // vee-validate の Field など静的解析できないカスタムコンポーネントに対して
      // 誤検知するため、id（for 属性の有無）のみを検証対象とする。
      'vuejs-accessibility/label-has-for': ['warn', { required: 'id' }],
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
]
