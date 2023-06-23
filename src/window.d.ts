import {
  EIP6963AnnounceProviderEvent,
  EIP6963RequestProviderEvent,
} from './index.d.ts'

declare global {
  interface WindowEventMap {
    'eip6963:announceProvider': EIP6963AnnounceProviderEvent
    'eip6963:requestProvider': EIP6963RequestProviderEvent
  }
}
