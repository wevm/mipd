/**
 * @vitest-environment jsdom
 */

import type { EIP1193Provider } from 'viem'
import { describe, expect, test } from 'vitest'

import {
  type EIP6963ProviderDetail,
  type Listener,
  announceProvider,
  createStore,
  requestProviders,
} from './index.js'

const detail_1 = {
  info: {
    icon: 'https://example.io/icon.png',
    name: 'Example Wallet',
    rdns: 'org.example',
    uuid: '350670db-19fa-4704-a166-e52e178b59d2',
  },
  provider: '<EIP1193Provider_1>' as unknown as EIP1193Provider,
} as const satisfies EIP6963ProviderDetail

const detail_2 = {
  info: {
    icon: 'https://foo.io/icon.png',
    name: 'Foo Wallet',
    rdns: 'org.foo',
    uuid: '12345555-19fa-4704-a166-e52e178b59d2',
  },
  provider: '<EIP1193Provider_2>' as unknown as EIP1193Provider,
} as const satisfies EIP6963ProviderDetail

describe('createStore', () => {
  test('_listeners', () => {
    const store = createStore()

    const unsubscribe_1 = store.subscribe(() => {})
    expect(store._listeners().size).toBe(1)

    const unsubscribe_2 = store.subscribe(() => {})
    store.subscribe(() => {})
    expect(store._listeners().size).toBe(3)

    store.subscribe(() => {})
    expect(store._listeners().size).toBe(4)

    unsubscribe_1()
    expect(store._listeners().size).toBe(3)
    unsubscribe_2()
    expect(store._listeners().size).toBe(2)

    store.destroy()
    expect(store._listeners().size).toBe(0)
  })

  test('clear', () => {
    const store = createStore()

    store.subscribe(() => {})
    store.subscribe(() => {})
    announceProvider(detail_1)()
    announceProvider(detail_2)()
    expect(store.getProviders().length).toBe(2)

    store.clear()
    expect(store.getProviders().length).toBe(0)
  })

  test('destroy', () => {
    const store = createStore()

    // Setting up listeners and announcing some provider details.
    store.subscribe(() => {})
    store.subscribe(() => {})
    store.subscribe(() => {})
    store.subscribe(() => {})
    announceProvider(detail_1)()
    announceProvider(detail_2)()
    expect(store.getProviders().length).toBe(2)
    expect(store._listeners().size).toBe(4)

    // Destroying should clear listeners and provider details.
    store.destroy()
    expect(store.getProviders().length).toBe(0)
    expect(store._listeners().size).toBe(0)

    announceProvider(detail_1)()
    announceProvider(detail_2)()

    expect(store.getProviders().length).toBe(0)
    expect(store._listeners().size).toBe(0)

    // Resetting after destroy should work and emit provider details.
    store.reset()

    store.subscribe(() => {})
    store.subscribe(() => {})
    announceProvider(detail_1)()
    announceProvider(detail_2)()

    expect(store.getProviders().length).toBe(2)
    expect(store._listeners().size).toBe(2)

    store.destroy()
  })

  test('find', () => {
    const store = createStore()

    announceProvider(detail_1)()
    expect(store.findProvider({ rdns: 'org.example' })).toBe(detail_1)
    expect(store.findProvider({ rdns: 'org.foo' })).toBe(undefined)

    announceProvider(detail_2)()
    expect(store.findProvider({ rdns: 'org.foo' })).toBe(detail_2)

    store.destroy()
  })

  test('get', async () => {
    const store = createStore()

    announceProvider(detail_1)()
    expect(store.getProviders()).toMatchInlineSnapshot(`
      [
        {
          "info": {
            "icon": "https://example.io/icon.png",
            "name": "Example Wallet",
            "rdns": "org.example",
            "uuid": "350670db-19fa-4704-a166-e52e178b59d2",
          },
          "provider": "<EIP1193Provider_1>",
        },
      ]
    `)

    await new Promise((resolve) => setTimeout(resolve, 1000))
    announceProvider(detail_2)()
    expect(store.getProviders()).toMatchInlineSnapshot(`
      [
        {
          "info": {
            "icon": "https://example.io/icon.png",
            "name": "Example Wallet",
            "rdns": "org.example",
            "uuid": "350670db-19fa-4704-a166-e52e178b59d2",
          },
          "provider": "<EIP1193Provider_1>",
        },
        {
          "info": {
            "icon": "https://foo.io/icon.png",
            "name": "Foo Wallet",
            "rdns": "org.foo",
            "uuid": "12345555-19fa-4704-a166-e52e178b59d2",
          },
          "provider": "<EIP1193Provider_2>",
        },
      ]
    `)

    // Test duplicate emitted detail
    announceProvider(detail_2)()
    expect(store.getProviders()).toMatchInlineSnapshot(`
      [
        {
          "info": {
            "icon": "https://example.io/icon.png",
            "name": "Example Wallet",
            "rdns": "org.example",
            "uuid": "350670db-19fa-4704-a166-e52e178b59d2",
          },
          "provider": "<EIP1193Provider_1>",
        },
        {
          "info": {
            "icon": "https://foo.io/icon.png",
            "name": "Foo Wallet",
            "rdns": "org.foo",
            "uuid": "12345555-19fa-4704-a166-e52e178b59d2",
          },
          "provider": "<EIP1193Provider_2>",
        },
      ]
    `)

    return store.destroy()
  })

  test('remove', () => {
    const store = createStore()

    const results: Parameters<Listener>[] = []
    store.subscribe((providerDetails, providerDetail) =>
      results.push([providerDetails, providerDetail]),
    )

    announceProvider(detail_1)()
    announceProvider(detail_2)()
    expect(store.getProviders().length).toBe(2)

    store.removeProvider({ rdns: detail_1.info.rdns })
    store.removeProvider({ rdns: 'bogus' })
    expect(store.getProviders().length).toBe(1)

    store.removeProvider({ rdns: detail_2.info.rdns })
    expect(store.getProviders().length).toBe(0)

    expect(results).toMatchInlineSnapshot(`
      [
        [
          [
            {
              "info": {
                "icon": "https://example.io/icon.png",
                "name": "Example Wallet",
                "rdns": "org.example",
                "uuid": "350670db-19fa-4704-a166-e52e178b59d2",
              },
              "provider": "<EIP1193Provider_1>",
            },
          ],
          {
            "added": [
              {
                "info": {
                  "icon": "https://example.io/icon.png",
                  "name": "Example Wallet",
                  "rdns": "org.example",
                  "uuid": "350670db-19fa-4704-a166-e52e178b59d2",
                },
                "provider": "<EIP1193Provider_1>",
              },
            ],
          },
        ],
        [
          [
            {
              "info": {
                "icon": "https://example.io/icon.png",
                "name": "Example Wallet",
                "rdns": "org.example",
                "uuid": "350670db-19fa-4704-a166-e52e178b59d2",
              },
              "provider": "<EIP1193Provider_1>",
            },
            {
              "info": {
                "icon": "https://foo.io/icon.png",
                "name": "Foo Wallet",
                "rdns": "org.foo",
                "uuid": "12345555-19fa-4704-a166-e52e178b59d2",
              },
              "provider": "<EIP1193Provider_2>",
            },
          ],
          {
            "added": [
              {
                "info": {
                  "icon": "https://foo.io/icon.png",
                  "name": "Foo Wallet",
                  "rdns": "org.foo",
                  "uuid": "12345555-19fa-4704-a166-e52e178b59d2",
                },
                "provider": "<EIP1193Provider_2>",
              },
            ],
          },
        ],
        [
          [
            {
              "info": {
                "icon": "https://foo.io/icon.png",
                "name": "Foo Wallet",
                "rdns": "org.foo",
                "uuid": "12345555-19fa-4704-a166-e52e178b59d2",
              },
              "provider": "<EIP1193Provider_2>",
            },
          ],
          {
            "removed": [
              {
                "info": {
                  "icon": "https://example.io/icon.png",
                  "name": "Example Wallet",
                  "rdns": "org.example",
                  "uuid": "350670db-19fa-4704-a166-e52e178b59d2",
                },
                "provider": "<EIP1193Provider_1>",
              },
            ],
          },
        ],
        [
          [],
          {
            "removed": [
              {
                "info": {
                  "icon": "https://foo.io/icon.png",
                  "name": "Foo Wallet",
                  "rdns": "org.foo",
                  "uuid": "12345555-19fa-4704-a166-e52e178b59d2",
                },
                "provider": "<EIP1193Provider_2>",
              },
            ],
          },
        ],
      ]
    `)

    store.destroy()
  })

  test('reset', () => {
    const store = createStore()

    announceProvider(detail_1)()
    announceProvider(detail_2)()
    expect(store.getProviders().length).toBe(2)

    store.reset()
    expect(store.getProviders().length).toBe(0)

    store.destroy()
  })

  test('subscribe', async () => {
    const store = createStore()

    let results: Parameters<Listener>[] = []
    const unsubscribe = store.subscribe((providerDetails, providerDetail) =>
      results.push([providerDetails, providerDetail]),
    )

    announceProvider(detail_1)()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    announceProvider(detail_2)()

    // Test duplicate emitted detail
    announceProvider(detail_2)()

    expect(results.length).toBe(2)
    expect(results[0]).toMatchInlineSnapshot(`
      [
        [
          {
            "info": {
              "icon": "https://example.io/icon.png",
              "name": "Example Wallet",
              "rdns": "org.example",
              "uuid": "350670db-19fa-4704-a166-e52e178b59d2",
            },
            "provider": "<EIP1193Provider_1>",
          },
        ],
        {
          "added": [
            {
              "info": {
                "icon": "https://example.io/icon.png",
                "name": "Example Wallet",
                "rdns": "org.example",
                "uuid": "350670db-19fa-4704-a166-e52e178b59d2",
              },
              "provider": "<EIP1193Provider_1>",
            },
          ],
        },
      ]
    `)
    expect(results[1]).toMatchInlineSnapshot(`
      [
        [
          {
            "info": {
              "icon": "https://example.io/icon.png",
              "name": "Example Wallet",
              "rdns": "org.example",
              "uuid": "350670db-19fa-4704-a166-e52e178b59d2",
            },
            "provider": "<EIP1193Provider_1>",
          },
          {
            "info": {
              "icon": "https://foo.io/icon.png",
              "name": "Foo Wallet",
              "rdns": "org.foo",
              "uuid": "12345555-19fa-4704-a166-e52e178b59d2",
            },
            "provider": "<EIP1193Provider_2>",
          },
        ],
        {
          "added": [
            {
              "info": {
                "icon": "https://foo.io/icon.png",
                "name": "Foo Wallet",
                "rdns": "org.foo",
                "uuid": "12345555-19fa-4704-a166-e52e178b59d2",
              },
              "provider": "<EIP1193Provider_2>",
            },
          ],
        },
      ]
    `)

    results = []

    store.destroy()
    expect(results).toMatchInlineSnapshot(`
      [
        [
          [],
          {
            "removed": [
              {
                "info": {
                  "icon": "https://example.io/icon.png",
                  "name": "Example Wallet",
                  "rdns": "org.example",
                  "uuid": "350670db-19fa-4704-a166-e52e178b59d2",
                },
                "provider": "<EIP1193Provider_1>",
              },
              {
                "info": {
                  "icon": "https://foo.io/icon.png",
                  "name": "Foo Wallet",
                  "rdns": "org.foo",
                  "uuid": "12345555-19fa-4704-a166-e52e178b59d2",
                },
                "provider": "<EIP1193Provider_2>",
              },
            ],
          },
        ],
      ]
    `)

    results = []

    unsubscribe()

    announceProvider(detail_1)()
    announceProvider(detail_2)()

    expect(results).toHaveLength(0)

    store.destroy()
  })

  test('subscribe (once)', () => {
    const store = createStore()

    announceProvider(detail_1)()
    announceProvider(detail_2)()

    const results: Parameters<Listener>[] = []
    store.subscribe((providerDetails, providerDetail) =>
      results.push([providerDetails, providerDetail]),
    )

    expect(results.length).toBe(0)

    store.subscribe(
      (providerDetails, providerDetail) =>
        results.push([providerDetails, providerDetail]),
      { once: true },
    )

    expect(results.length).toBe(1)
    expect(results).toMatchInlineSnapshot(`
      [
        [
          [
            {
              "info": {
                "icon": "https://example.io/icon.png",
                "name": "Example Wallet",
                "rdns": "org.example",
                "uuid": "350670db-19fa-4704-a166-e52e178b59d2",
              },
              "provider": "<EIP1193Provider_1>",
            },
            {
              "info": {
                "icon": "https://foo.io/icon.png",
                "name": "Foo Wallet",
                "rdns": "org.foo",
                "uuid": "12345555-19fa-4704-a166-e52e178b59d2",
              },
              "provider": "<EIP1193Provider_2>",
            },
          ],
          {
            "added": [
              {
                "info": {
                  "icon": "https://example.io/icon.png",
                  "name": "Example Wallet",
                  "rdns": "org.example",
                  "uuid": "350670db-19fa-4704-a166-e52e178b59d2",
                },
                "provider": "<EIP1193Provider_1>",
              },
              {
                "info": {
                  "icon": "https://foo.io/icon.png",
                  "name": "Foo Wallet",
                  "rdns": "org.foo",
                  "uuid": "12345555-19fa-4704-a166-e52e178b59d2",
                },
                "provider": "<EIP1193Provider_2>",
              },
            ],
          },
        ],
      ]
    `)
  })
})

test('requestProviders', async () => {
  const results: EIP6963ProviderDetail<EIP1193Provider>[] = []
  const unwatch = requestProviders((providerDetail) => {
    results.push(providerDetail)
  })

  announceProvider(detail_1)()
  await new Promise((resolve) => setTimeout(resolve, 1000))
  announceProvider(detail_2)()

  expect(results.length).toBe(2)
  expect(results[0]).toMatchInlineSnapshot(`
    {
      "info": {
        "icon": "https://example.io/icon.png",
        "name": "Example Wallet",
        "rdns": "org.example",
        "uuid": "350670db-19fa-4704-a166-e52e178b59d2",
      },
      "provider": "<EIP1193Provider_1>",
    }
  `)
  expect(results[1]).toMatchInlineSnapshot(`
    {
      "info": {
        "icon": "https://foo.io/icon.png",
        "name": "Foo Wallet",
        "rdns": "org.foo",
        "uuid": "12345555-19fa-4704-a166-e52e178b59d2",
      },
      "provider": "<EIP1193Provider_2>",
    }
  `)

  unwatch()
})
