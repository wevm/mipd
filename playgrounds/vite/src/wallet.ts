import { EIP1193Provider, announceProvider } from 'mipd'
import 'mipd/window'

announceProvider({
  info: {
    icon: 'https://example.io/icon.png',
    name: 'Example Wallet',
    rdns: 'org.example',
    uuid: '350670db-19fa-4704-a166-e52e178b59d2',
  },
  provider: '<EIP1193Provider_1>' as unknown as EIP1193Provider,
})
