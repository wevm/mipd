import { ResolvedConfig } from './config.d.ts'

type DefaultProvider = ResolvedConfig['EIP1193Provider']

export interface EIP6963ProviderDetail<TProvider = DefaultProvider> {
  info: EIP6963ProviderInfo
  provider: TProvider
}

export interface EIP6963ProviderInfo {
  icon: string
  name: string
  rdns?: 'com.enkrypt' | 'io.metamask' | (string & {})
  uuid: string
}

export interface EIP6963AnnounceProviderEvent<TProvider = DefaultProvider>
  extends CustomEvent<EIP6963ProviderDetail<TProvider>> {
  type: 'eip6963:announceProvider'
}

export interface EIP6963RequestProviderEvent extends Event {
  type: 'eip6963:requestProvider'
}
