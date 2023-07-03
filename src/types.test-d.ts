import type { EIP1193Provider } from 'viem'
import { expectTypeOf, test } from 'vitest'

import type {
  EIP6963AnnounceProviderEvent,
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
  EIP6963RequestProviderEvent,
} from './index.js'

test('EIP6963ProviderInfo', () => {
  expectTypeOf<EIP6963ProviderInfo['icon']>().toEqualTypeOf<string>
  expectTypeOf<EIP6963ProviderInfo['name']>().toEqualTypeOf<string>
  expectTypeOf<EIP6963ProviderInfo['rdns']>().toEqualTypeOf<
    undefined | 'com.enkrypt' | 'io.metamask' | (string & {})
  >
  expectTypeOf<EIP6963ProviderInfo['uuid']>().toEqualTypeOf<string>

  const KnownRdns_1: EIP6963ProviderInfo = {
    icon: 'https://metamask.io/icon.png',
    name: 'MetaMask',
    rdns: 'io.metamask',
    uuid: '350670db-19fa-4704-a166-e52e178b59d2',
  }
  KnownRdns_1

  const UnknownRdns_1: EIP6963ProviderInfo = {
    icon: 'https://wallet.example.org/icon.png',
    name: 'Example Wallet',
    rdns: 'org.example',
    uuid: '350670db-19fa-4704-a166-e52e178b59d2',
  }
  UnknownRdns_1

  const NoRdns_1: EIP6963ProviderInfo = {
    icon: 'https://example.com/icon.png',
    name: 'Example Wallet',
    uuid: '350670db-19fa-4704-a166-e52e178b59d2',
  }
  NoRdns_1
})

test('EIP6963ProviderDetail', () => {
  expectTypeOf<EIP6963ProviderDetail['info']>()
    .toEqualTypeOf<EIP6963ProviderInfo>
  expectTypeOf<EIP6963ProviderDetail['provider']>()
    .toEqualTypeOf<EIP1193Provider>

  type CustomProvider = { request: () => void }
  expectTypeOf<EIP6963ProviderDetail<CustomProvider>['provider']>()
    .toEqualTypeOf<CustomProvider>
})

test('EIP6963AnnounceProviderEvent', () => {
  expectTypeOf<EIP6963AnnounceProviderEvent['detail']>().toEqualTypeOf<
    EIP6963ProviderDetail<EIP1193Provider>
  >()
  expectTypeOf<
    EIP6963AnnounceProviderEvent['type']
  >().toEqualTypeOf<'eip6963:announceProvider'>()

  type CustomProvider = { request: () => void }
  expectTypeOf<
    EIP6963AnnounceProviderEvent<CustomProvider>['detail']
  >().toEqualTypeOf<EIP6963ProviderDetail<CustomProvider>>()
})

test('EIP6963RequestProviderEvent', () => {
  expectTypeOf<
    EIP6963RequestProviderEvent['type']
  >().toEqualTypeOf<'eip6963:requestProvider'>()
})
