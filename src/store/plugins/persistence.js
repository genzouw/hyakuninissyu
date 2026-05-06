// localStorage との同期を担う Vuex プラグイン。
// paths で渡したドット区切り state パスを localStorage の key に対応付け、
// hydration（起動時読み込み）と mutation 後の永続化を一括で扱う。
//
// 使用例:
//   createPersistencePlugin([
//     { path: 'collection.collectedPoemIds', key: 'collectedPoemIds', default: [] }
//   ])
//
// オプション `options.storage` を渡すとテスト時に独自ストレージを注入できる。

function getByPath (obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj)
}

function defaultStorage () {
  if (typeof localStorage !== 'undefined') return localStorage
  if (typeof global !== 'undefined' && global.localStorage) return global.localStorage
  return null
}

function readFromStorage (storage, key, fallback) {
  if (!storage) return fallback
  try {
    const raw = storage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch (e) {
    console.error('persistence: failed to parse localStorage key "' + key + '":', e)
    if (typeof storage.removeItem === 'function') storage.removeItem(key)
    return fallback
  }
}

function writeToStorage (storage, key, serialized) {
  if (!storage) return
  try {
    storage.setItem(key, serialized)
  } catch (e) {
    console.error('persistence: failed to write localStorage key "' + key + '":', e)
  }
}

export default function createPersistencePlugin (paths, options) {
  const opts = options || {}
  return function plugin (store) {
    const storage = opts.storage || defaultStorage()

    // hydration: 既存の localStorage 値を state に反映
    paths.forEach(entry => {
      const value = readFromStorage(storage, entry.key, entry.default)
      const segments = entry.path.split('.')
      const moduleName = segments[0]
      const stateKey = segments[segments.length - 1]
      store.commit(moduleName + '/HYDRATE', { key: stateKey, value })
    })

    // 永続化: 値が前回と同一の場合は書き込みをスキップしてオーバーヘッドを減らす
    const lastSerialized = {}
    store.subscribe((mutation, state) => {
      paths.forEach(entry => {
        const value = getByPath(state, entry.path)
        if (value === undefined) return
        let serialized
        try {
          serialized = JSON.stringify(value)
        } catch (e) {
          console.error('persistence: failed to serialize key "' + entry.key + '":', e)
          return
        }
        if (lastSerialized[entry.key] === serialized) return
        lastSerialized[entry.key] = serialized
        writeToStorage(storage, entry.key, serialized)
      })
    })
  }
}
