import { createStore } from 'mipd'
import { useSyncExternalStore } from 'react'
import ReactDOM from 'react-dom/client'

const store = createStore()

export default function App() {
  const providers = useSyncExternalStore(store.subscribe, store.getProviders)
  return <pre>{JSON.stringify(providers, null, 2)}</pre>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />,
)
