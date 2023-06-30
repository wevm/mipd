/**
 * @vitest-environment jsdom
 */

import type { EIP1193Provider } from 'viem'
import { describe, expect, test } from 'vitest'

import {
  type EIP6963ProviderDetail,
  type Listener,
  announceProvider,
  mipdStore,
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

describe('mipdStore', () => {
  test('_listeners', () => {
    const mipd = mipdStore()

    const unsubscribe_1 = mipd.subscribe(() => {})
    expect(mipd._listeners().size).toBe(1)

    const unsubscribe_2 = mipd.subscribe(() => {})
    mipd.subscribe(() => {})
    expect(mipd._listeners().size).toBe(3)

    mipd.subscribe(() => {})
    expect(mipd._listeners().size).toBe(4)

    unsubscribe_1()
    expect(mipd._listeners().size).toBe(3)
    unsubscribe_2()
    expect(mipd._listeners().size).toBe(2)

    mipd.destroy()
    expect(mipd._listeners().size).toBe(0)
  })

  test('clear', () => {
    const mipd = mipdStore()

    mipd.subscribe(() => {})
    mipd.subscribe(() => {})
    announceProvider(detail_1)()
    announceProvider(detail_2)()
    expect(mipd.getProviders().length).toBe(2)

    mipd.clear()
    expect(mipd.getProviders().length).toBe(0)
  })

  test('destroy', () => {
    const mipd = mipdStore()

    // Setting up listeners and announcing some provider details.
    mipd.subscribe(() => {})
    mipd.subscribe(() => {})
    mipd.subscribe(() => {})
    mipd.subscribe(() => {})
    announceProvider(detail_1)()
    announceProvider(detail_2)()
    expect(mipd.getProviders().length).toBe(2)
    expect(mipd._listeners().size).toBe(4)

    // Destroying should clear listeners and provider details.
    mipd.destroy()
    expect(mipd.getProviders().length).toBe(0)
    expect(mipd._listeners().size).toBe(0)

    announceProvider(detail_1)()
    announceProvider(detail_2)()

    expect(mipd.getProviders().length).toBe(0)
    expect(mipd._listeners().size).toBe(0)

    // Resetting after destroy should work and emit provider details.
    mipd.reset()

    mipd.subscribe(() => {})
    mipd.subscribe(() => {})
    announceProvider(detail_1)()
    announceProvider(detail_2)()

    expect(mipd.getProviders().length).toBe(2)
    expect(mipd._listeners().size).toBe(2)

    mipd.destroy()
  })

  test('find', () => {
    const mipd = mipdStore()

    announceProvider(detail_1)()
    expect(mipd.findProvider({ rdns: 'org.example' })).toBe(detail_1)
    expect(mipd.findProvider({ rdns: 'org.foo' })).toBe(undefined)

    announceProvider(detail_2)()
    expect(mipd.findProvider({ rdns: 'org.foo' })).toBe(detail_2)

    mipd.destroy()
  })

  test('get', async () => {
    const mipd = mipdStore()

    announceProvider(detail_1)()
    expect(mipd.getProviders()).toMatchInlineSnapshot(`
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
    expect(mipd.getProviders()).toMatchInlineSnapshot(`
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
    expect(mipd.getProviders()).toMatchInlineSnapshot(`
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

    return mipd.destroy()
  })

  test('remove', () => {
    const mipd = mipdStore()

    const results: Parameters<Listener>[] = []
    mipd.subscribe((providerDetails, providerDetail) =>
      results.push([providerDetails, providerDetail]),
    )

    announceProvider(detail_1)()
    announceProvider(detail_2)()
    expect(mipd.getProviders().length).toBe(2)

    mipd.removeProvider({ rdns: detail_1.info.rdns })
    mipd.removeProvider({ rdns: 'bogus' })
    expect(mipd.getProviders().length).toBe(1)

    mipd.removeProvider({ rdns: detail_2.info.rdns })
    expect(mipd.getProviders().length).toBe(0)

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

    mipd.destroy()
  })

  test('reset', () => {
    const mipd = mipdStore()

    announceProvider(detail_1)()
    announceProvider(detail_2)()
    expect(mipd.getProviders().length).toBe(2)

    mipd.reset()
    expect(mipd.getProviders().length).toBe(0)

    mipd.destroy()
  })

  test('subscribe', async () => {
    const mipd = mipdStore()

    let results: Parameters<Listener>[] = []
    const unsubscribe = mipd.subscribe((providerDetails, providerDetail) =>
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

    mipd.destroy()
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

    mipd.destroy()
  })

  test('subscribe (once)', () => {
    const mipd = mipdStore()

    announceProvider(detail_1)()
    announceProvider(detail_2)()

    const results: Parameters<Listener>[] = []
    mipd.subscribe((providerDetails, providerDetail) =>
      results.push([providerDetails, providerDetail]),
    )

    expect(results.length).toBe(0)

    mipd.subscribe(
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
