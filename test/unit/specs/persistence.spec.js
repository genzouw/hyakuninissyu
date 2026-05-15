import { createStore } from 'vuex'
import createPersistencePlugin from '@/store/plugins/persistence'

const KEY = 'test_collected'

function createMockLocalStorage (initial) {
  const store = Object.assign({}, initial || {})
  return {
    getItem: jest.fn((k) => (k in store ? store[k] : null)),
    setItem: jest.fn((k, v) => {
      store[k] = v
    }),
    removeItem: jest.fn((k) => {
      delete store[k]
    }),
    _backing: store,
  }
}

function buildStore (plugin) {
  return createStore({
    modules: {
      collection: {
        namespaced: true,
        state: { collectedPoemIds: [] },
        mutations: {
          ADD (state, id) {
            state.collectedPoemIds.push(id)
          },
        },
      },
    },
    plugins: [plugin],
  })
}

describe('persistence plugin', () => {
  it('hydrates state from localStorage at startup', () => {
    const storage = createMockLocalStorage({ [KEY]: JSON.stringify([10, 20]) })
    const plugin = createPersistencePlugin(
      [{ path: 'collection.collectedPoemIds', key: KEY, default: [] }],
      { storage }
    )
    const store = buildStore(plugin)
    expect(store.state.collection.collectedPoemIds).toEqual([10, 20])
  })

  it('falls back to default when localStorage has no value', () => {
    const storage = createMockLocalStorage()
    const plugin = createPersistencePlugin(
      [{ path: 'collection.collectedPoemIds', key: KEY, default: [] }],
      { storage }
    )
    const store = buildStore(plugin)
    expect(store.state.collection.collectedPoemIds).toEqual([])
  })

  it('falls back to default and clears storage when JSON parse fails', () => {
    const storage = createMockLocalStorage({ [KEY]: '{not-json' })
    const plugin = createPersistencePlugin(
      [{ path: 'collection.collectedPoemIds', key: KEY, default: [] }],
      { storage }
    )
    const store = buildStore(plugin)
    expect(store.state.collection.collectedPoemIds).toEqual([])
    expect(storage.removeItem).toHaveBeenCalledWith(KEY)
  })

  it('writes to localStorage on every mutation', () => {
    const storage = createMockLocalStorage()
    const plugin = createPersistencePlugin(
      [{ path: 'collection.collectedPoemIds', key: KEY, default: [] }],
      { storage }
    )
    const store = buildStore(plugin)
    store.commit('collection/ADD', 7)
    expect(storage.setItem).toHaveBeenCalledWith(KEY, JSON.stringify([7]))
    store.commit('collection/ADD', 9)
    expect(storage.setItem).toHaveBeenLastCalledWith(
      KEY,
      JSON.stringify([7, 9])
    )
  })
})
