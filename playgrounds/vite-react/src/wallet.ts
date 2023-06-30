import { EIP1193Provider, announceProvider } from 'mipd'
import 'mipd/window'

announceProvider({
  info: {
    icon: 'https://example.io/icon.png',
    name: 'Example Wallet',
    rdns: 'org.example',
    uuid: '350670db-19fa-4704-a166-e52e178b59d1',
  },
  provider: '<EIP1193Provider_1>' as unknown as EIP1193Provider,
})

announceProvider({
  info: {
    icon: 'https://foo.io/icon.png',
    name: 'Foo Wallet',
    rdns: 'org.foo',
    uuid: '350670db-19fa-4704-a166-e52e178b59d2',
  },
  provider: '<EIP1193Provider_2>' as unknown as EIP1193Provider,
})

await new Promise((res) => setTimeout(res, 1000))

announceProvider({
  info: {
    icon: 'https://bar.io/icon.png',
    name: 'Bar Wallet',
    rdns: 'io.bar',
    uuid: '350670db-19fa-4704-a166-e52e178b59d3',
  },
  provider: '<EIP1193Provider_3>' as unknown as EIP1193Provider,
})

await new Promise((res) => setTimeout(res, 1000))

announceProvider({
  info: {
    icon: 'https://baz.io/icon.png',
    name: 'Baz Wallet',
    rdns: 'com.baz',
    uuid: '350670db-19fa-4704-a166-e52e178b59d4',
  },
  provider: '<EIP1193Provider_3>' as unknown as EIP1193Provider,
})
