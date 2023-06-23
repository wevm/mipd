/**
 * @vitest-environment jsdom
 */

import { expect, test } from 'vitest'

import { EIP6963ProviderDetail } from './eip6963.js'
import { announceProvider, requestProviders } from './index.js'
import { EIP1193Provider } from 'viem'

const detail_1: EIP6963ProviderDetail = {
  info: {
    icon: 'https://example.io/icon.png',
    name: 'Example Wallet',
    rdns: 'org.example',
    uuid: '350670db-19fa-4704-a166-e52e178b59d2',
  },
  provider: '<EIP1193Provider_1>' as unknown as EIP1193Provider,
}
const detail_2: EIP6963ProviderDetail = {
  info: {
    icon: 'https://foo.io/icon.png',
    name: 'Foo Wallet',
    rdns: 'org.foo',
    uuid: '12345555-19fa-4704-a166-e52e178b59d2',
  },
  provider: '<EIP1193Provider_2>' as unknown as EIP1193Provider,
}

test('announceProvider + requestProviders', async () => {
  const results: [
    EIP6963ProviderDetail<EIP1193Provider>,
    EIP6963ProviderDetail<EIP1193Provider>[],
  ][] = []
  const unwatch = requestProviders((providerDetail, providerDetails) => {
    results.push([providerDetail, providerDetails])
  })

  announceProvider(detail_1)
  await new Promise((resolve) => setTimeout(resolve, 1000))
  announceProvider(detail_2)

  // Test duplicate emitted detail
  announceProvider(detail_2)

  expect(results.length).toBe(2)
  expect(results[0]).toMatchInlineSnapshot(`
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
    ]
  `)
  expect(results[1]).toMatchInlineSnapshot(`
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
    ]
  `)

  unwatch()
})
