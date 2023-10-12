/** @vitest-environment jsdom */
import type { EIP1193Provider } from 'viem'
import { expect, test } from 'vitest'

import type { EIP6963ProviderDetail } from './types.js'
import { announceProvider, requestProviders } from './utils.js'

const detail_1 = {
  info: {
    icon: 'data:image/svg+xml,<svg width="32px" height="32px" viewBox="0 0 32 32"/>',
    name: 'Example Wallet',
    rdns: 'org.example',
    uuid: '350670db-19fa-4704-a166-e52e178b59d2',
  },
  provider: '<EIP1193Provider_1>' as unknown as EIP1193Provider,
} as const satisfies EIP6963ProviderDetail

const detail_2 = {
  info: {
    icon: 'data:image/svg+xml,<svg width="32px" height="32px" viewBox="0 0 32 32"/>',
    name: 'Foo Wallet',
    rdns: 'org.foo',
    uuid: '12345555-19fa-4704-a166-e52e178b59d2',
  },
  provider: '<EIP1193Provider_2>' as unknown as EIP1193Provider,
} as const satisfies EIP6963ProviderDetail

test('requestProviders', async () => {
  const results: EIP6963ProviderDetail<EIP1193Provider>[] = []
  const unsubscribe = requestProviders((providerDetail) => {
    results.push(providerDetail)
  })

  announceProvider(detail_1)()
  await new Promise((resolve) => setTimeout(resolve, 1000))
  announceProvider(detail_2)()

  expect(results.length).toBe(2)
  expect(results[0]).toMatchInlineSnapshot(`
    {
      "info": {
        "icon": "data:image/svg+xml,<svg width=\\"32px\\" height=\\"32px\\" viewBox=\\"0 0 32 32\\"/>",
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
        "icon": "data:image/svg+xml,<svg width=\\"32px\\" height=\\"32px\\" viewBox=\\"0 0 32 32\\"/>",
        "name": "Foo Wallet",
        "rdns": "org.foo",
        "uuid": "12345555-19fa-4704-a166-e52e178b59d2",
      },
      "provider": "<EIP1193Provider_2>",
    }
  `)

  unsubscribe?.()
})
