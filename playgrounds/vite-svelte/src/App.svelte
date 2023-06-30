<script lang="ts">
  import { mipdStore } from 'mipd'
  import { readable } from 'svelte/store'
  const mipd = mipdStore()
  const providers = readable(mipd.getProviders(), mipd.subscribe)
</script>

<pre>{JSON.stringify($providers, null, 2)}</pre>

