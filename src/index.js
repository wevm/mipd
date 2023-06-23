/**
 * @typedef {import('./config.ts').ResolvedConfig['EIP1193Provider']} EIP1193Provider
 * @typedef {import('./config.ts').ResolvedConfig['Rdns']} Rdns
 */

/**
 * @typedef {import('./eip6963.ts').EIP6963ProviderDetail<TProvider, TRdns>} EIP6963ProviderDetail<TProvider, TRdns>
 * @template [TProvider=EIP1193Provider]
 * @template {string} [TRdns=Rdns]
 *
 * @typedef {import('./eip6963.ts').EIP6963AnnounceProviderEvent} EIP6963AnnounceProviderEvent
 * @typedef {import('./eip6963.ts').EIP6963ProviderInfo} EIP6963ProviderInfo
 * @typedef {import('./eip6963.ts').EIP6963RequestProviderEvent} EIP6963RequestProviderEvent
 */

/**
 * @typedef {EIP6963ProviderDetail<EIP1193Provider, string>} AnnounceProviderParameters
 * @typedef {() => void} AnnounceProviderReturnType
 */

/**
 * Announces an EIP-1193 Provider.
 *
 * @param {AnnounceProviderParameters} detail
 * @returns {AnnounceProviderReturnType}
 */
export function announceProvider(detail) {
  /** @type {CustomEvent<EIP6963ProviderDetail>} */
  const event = new CustomEvent('eip6963:announceProvider', { detail })

  window.dispatchEvent(event)

  const handler = () => window.dispatchEvent(event)
  window.addEventListener('eip6963:requestProvider', handler)
  return () => window.removeEventListener('eip6963:requestProvider', handler)
}

/**
 * @typedef {(providerDetail: EIP6963ProviderDetail, providerDetails: EIP6963ProviderDetail[]) => void} RequestProvidersParameters
 * @typedef {() => void} RequestProvidersReturnType
 */

/**
 * Watches for EIP-1193 Providers to be announced.
 *
 * @param {RequestProvidersParameters} cb
 * @returns {RequestProvidersReturnType}
 */
export function requestProviders(cb) {
  /** @type {EIP6963ProviderDetail[]} */
  const providerDetails = []

  /** @param {EIP6963AnnounceProviderEvent} event */
  const handler = (event) => {
    const providerDetail = event.detail
    if (
      providerDetails.some(({ info }) => info.uuid === providerDetail.info.uuid)
    )
      return
    providerDetails.push(providerDetail)
    cb(event.detail, providerDetails)
  }

  window.addEventListener('eip6963:announceProvider', handler)

  window.dispatchEvent(new CustomEvent('eip6963:requestProvider'))

  return () => window.removeEventListener('eip6963:announceProvider', handler)
}
