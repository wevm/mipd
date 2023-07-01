import type { EIP1193Provider } from 'viem'

/**
 * Override `Config` to customize type options
 *
 * @example
 * import { EIP1193Provider } from './eip1193'
 *
 * declare module 'mipd' {
 *   export interface Config {
 *     EIP1193Provider: EIP1193Provider
 *   }
 * }
 */
export interface Config {
  [key: string]: undefined
}

/**
 * Default {@link Config} options
 */
export interface DefaultConfig {
  /** The EIP-1193 Provider. */
  EIP1193Provider: EIP1193Provider
  /** Reverse Domain Name Notation (rDNS) of the Wallet Provider. */
  Rdns: string
}

/**
 * Resolved {@link Config} between user defined options and {@link DefaultConfig}
 *
 * @example
 * import { ResolvedConfig } from 'mipd'
 *
 * ResolvedConfig['EIP1193Provider']
 */
export interface ResolvedConfig {
  EIP1193Provider: IsDefined<Config['EIP1193Provider']> extends true
    ? Config['EIP1193Provider']
    : DefaultConfig['EIP1193Provider']
  Rdns: IsDefined<Config['Rdns']> extends true
    ? Config['Rdns']
    : DefaultConfig['Rdns']
}

type IsDefined<T> = T extends undefined ? false : true
