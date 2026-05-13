// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    sourceType: 'module',
    ecmaVersion: 2021,
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // This project is on Vue 2, so use the `vue2-` prefixed presets explicitly.
    // For stricter rules, switch to `plugin:vue/vue2-strongly-recommended` or `plugin:vue/vue2-recommended`.
    // (In eslint-plugin-vue v10, the unprefixed aliases point to Vue 3 presets and must not be used here.)
    'plugin:vue/vue2-essential',
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard',
  ],
  // required to lint *.vue files
  plugins: ['vue'],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // cyclomatic complexity - error if complexity exceeds 10
    complexity: ['error', { max: 10 }],
    // single-word root component names (Top / Playing / Collection / Badges)
    // are intentional in this single-page Vue 2 app; they are entry-route
    // components, not reusable library components.
    'vue/multi-word-component-names': 'off',
  },
};
