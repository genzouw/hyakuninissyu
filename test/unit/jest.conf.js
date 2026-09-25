const path = require('path')

module.exports = {
  rootDir: path.resolve(__dirname, '../../'),
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'mjs', 'json', 'vue'],
  moduleNameMapper: {
    '\\.(png|jpe?g|gif|svg|webp|mp3|wav|ogg|woff2?|ttf|otf|eot)$':
      '<rootDir>/test/unit/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    // bootstrap-vue-next 0.46 以降は ESM 専用（CJS ビルドなし）になったため、
    // node_modules 配下の .js / .mjs を CommonJS へ変換する。
    // node_modules には .babelrc が適用されないので Babel 設定をインラインで明示する。
    // ここは transformIgnorePatterns で許可したパッケージにのみ適用される。
    '/node_modules/.+\\.m?js$': [
      '<rootDir>/node_modules/babel-jest',
      {
        babelrc: false,
        configFile: false,
        presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
      },
    ],
    // build/ 配下のビルドスクリプト (ESM) をテストから import するために変換する。
    '^.+\\.m?js$': '<rootDir>/node_modules/babel-jest',
    '.*\\.(vue)$': '<rootDir>/node_modules/@vue/vue3-jest',
  },
  // 既定では node_modules 全体が変換対象外なので、ESM 専用パッケージのみ許可する。
  // perfect-debounce は bootstrap-vue-next が依存する ESM 専用パッケージ。
  // nostics は vue-router 5.2.0 以降が依存する ESM 専用パッケージで、
  // vue-router の CJS ビルドから require されるため変換が必要。
  transformIgnorePatterns: [
    '/node_modules/(?!(bootstrap-vue-next|perfect-debounce|nostics)/)',
  ],
  // Playwright の E2E (test/e2e) は jest ではなく `bun run test:e2e` で実行する。
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/test/e2e/'],
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
  setupFiles: ['<rootDir>/test/unit/setup'],
  coverageDirectory: '<rootDir>/test/unit/coverage',
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js',
    '!src/router/index.js',
    '!**/node_modules/**',
  ],
  // カバレッジの下限（ラチェット）。実測値（45.81 / 31.08 / 47.36 / 46.02）より少し低く置く。
  // 実測値そのものではなく「下がってはいけない下限」なので、実測が安定して上回ってから引き上げる。
  coverageThreshold: {
    global: {
      statements: 44,
      branches: 30,
      functions: 45,
      lines: 44,
    },
  },
}
