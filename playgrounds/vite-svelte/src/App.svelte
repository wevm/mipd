<script lang="ts">
  import { createStore } from 'mipd'
  import { readable } from 'svelte/store'
  const store = createStore()
  const providers = readable(store.getProviders(), store.subscribe)
</script>

<pre>{JSON.stringify($providers, null, 2)}</pre>

