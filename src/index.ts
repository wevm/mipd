import type {
  EIP1193Provider,
  EIP6963AnnounceProviderEvent,
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
  EIP6963RequestProviderEvent,
  Rdns,
} from './types.js'

export type {
  EIP6963ProviderDetail,
  EIP1193Provider,
  EIP6963AnnounceProviderEvent,
  EIP6963ProviderInfo,
  EIP6963RequestProviderEvent,
  Rdns,
}

////////////////////////////////////////////////////////////////////////////
// MIPD Store

export type Listener = (
  providerDetails: EIP6963ProviderDetail[],
  meta?: {
    added?: EIP6963ProviderDetail[]
    removed?: EIP6963ProviderDetail[]
  },
) => void

export type Store = {
  /**
   * @internal
   * Current state of listening listeners.
   */
  _listeners(): Set<Listener>
  /**
   * Clears the store, including all provider details.
   */
  clear(): void
  /**
   * Destroys the store, including all provider details and listeners.
   */
  destroy(): void
  /**
   * Finds a provider detail by its RDNS (Reverse Domain Name Identifier).
   */
  findProvider(args: { rdns: Rdns }): EIP6963ProviderDetail | undefined
  /**
   * Returns all provider details that have been emitted.
   */
  getProviders(): EIP6963ProviderDetail[]
  /**
   * Resets the store, and emits an event to request provider details.
   */
  reset(): void
  /**
   * Removes a provider detail by its RDNS (Reverse Domain Name Identifier).
   */
  removeProvider(args: { rdns: Rdns }): void
  /**
   * Subscribes to emitted provider details.
   */
  subscribe(listener: Listener, args?: { emitImmediately?: boolean }): () => void
}

export function createStore(): Store {
  const listeners: Set<Listener> = new Set()
  let providerDetails: EIP6963ProviderDetail[] = []

  const request = () =>
    requestProviders((providerDetail) => {
      if (
        providerDetails.some(
          ({ info }) => info.uuid === providerDetail.info.uuid,
        )
      )
        return

      providerDetails = [...providerDetails, providerDetail]
      listeners.forEach((listener) =>
        listener(providerDetails, { added: [providerDetail] }),
      )
    })
  let unwatch = request()

  return {
    _listeners() {
      return listeners
    },
    clear() {
      listeners.forEach((listener) =>
        listener([], { removed: [...providerDetails] }),
      )
      providerDetails = []
    },
    destroy() {
      this.clear()
      listeners.clear()
      unwatch()
    },
    findProvider({ rdns }) {
      return providerDetails.find(
        (providerDetail) => providerDetail.info.rdns === rdns,
      )
    },
    getProviders() {
      return providerDetails
    },
    removeProvider({ rdns }) {
      const providerDetail = providerDetails.find(
        (providerDetail) => providerDetail.info.rdns === rdns,
      )
      if (!providerDetail) return

      providerDetails = providerDetails.filter(
        (providerDetail) => providerDetail.info.rdns !== rdns,
      )
      listeners.forEach((listener) =>
        listener(providerDetails, { removed: [providerDetail] }),
      )
    },
    reset() {
      this.clear()
      unwatch()
      unwatch = request()
    },
    subscribe(listener, { emitImmediately } = {}) {
      listeners.add(listener)
      if (emitImmediately) listener(providerDetails, { added: providerDetails })
      return () => listeners.delete(listener)
    },
  }
}

////////////////////////////////////////////////////////////////////////////
// Announce Provider

export type AnnounceProviderParameters = EIP6963ProviderDetail<
  EIP1193Provider,
  string
>
export type AnnounceProviderReturnType = () => void

/**
 * Announces an EIP-1193 Provider.
 */
export function announceProvider(
  detail: AnnounceProviderParameters,
): AnnounceProviderReturnType {
  const event: CustomEvent<EIP6963ProviderDetail> = new CustomEvent(
    'eip6963:announceProvider',
    { detail },
  )

  window.dispatchEvent(event)

  const handler = () => window.dispatchEvent(event)
  window.addEventListener('eip6963:requestProvider', handler)
  return () => window.removeEventListener('eip6963:requestProvider', handler)
}

////////////////////////////////////////////////////////////////////////////
// Request Providers

export type RequestProvidersParameters = (
  providerDetail: EIP6963ProviderDetail,
) => void
export type RequestProvidersReturnType = () => void

/**
 * Watches for EIP-1193 Providers to be announced.
 */
export function requestProviders(
  listener: RequestProvidersParameters,
): RequestProvidersReturnType {
  const handler = (event: EIP6963AnnounceProviderEvent) =>
    listener(event.detail)

  window.addEventListener('eip6963:announceProvider', handler)

  window.dispatchEvent(new CustomEvent('eip6963:requestProvider'))

  return () => window.removeEventListener('eip6963:announceProvider', handler)
}
