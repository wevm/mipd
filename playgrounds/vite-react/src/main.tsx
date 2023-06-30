import { mipdStore } from 'mipd'
import { useSyncExternalStore } from 'react'
import ReactDOM from 'react-dom/client'

const mipd = mipdStore()

export default function App() {
  const providers = useSyncExternalStore(mipd.subscribe, mipd.getProviders)
  return <pre>{JSON.stringify(providers, null, 2)}</pre>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />,
)
