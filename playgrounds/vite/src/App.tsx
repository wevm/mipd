import { EIP6963ProviderDetail, requestProviders } from 'mipd'
import { useEffect, useState } from 'react'

export default function App() {
  const [providerDetails, setProviderDetails] = useState<
    EIP6963ProviderDetail[]
  >([])
  useEffect(
    () =>
      requestProviders((providerDetail) => {
        setProviderDetails((x) => [...x, providerDetail])
      }),
    [],
  )
  return <pre>{JSON.stringify(providerDetails, null, 2)}</pre>
}
