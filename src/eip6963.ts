import { ResolvedConfig } from './config.ts'

type Provider = ResolvedConfig['EIP1193Provider']
type Rdns = ResolvedConfig['Rdns']

/**
 * Event detail from the `"eip6963:announceProvider"` event.
 */
export interface EIP6963ProviderDetail<
  TProvider = Provider,
  TRdns extends string = Rdns,
> {
  info: EIP6963ProviderInfo<TRdns>
  provider: TProvider
}

/**
 * Metadata of the EIP-1193 Provider.
 */
export interface EIP6963ProviderInfo<TRdns extends string = Rdns> {
  icon: string
  name: string
  rdns?: TRdns
  uuid: string
}

/**
 * Event type to announce an EIP-1193 Provider.
 */
export interface EIP6963AnnounceProviderEvent<TProvider = Provider>
  extends CustomEvent<EIP6963ProviderDetail<TProvider>> {
  type: 'eip6963:announceProvider'
}

/**
 * Event type to request EIP-1193 Providers.
 */
export interface EIP6963RequestProviderEvent extends Event {
  type: 'eip6963:requestProvider'
}
