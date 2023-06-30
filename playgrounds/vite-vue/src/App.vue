<script setup lang="ts">
  import { reactive } from 'vue'
  import { mipdStore } from 'mipd'

  const store = mipdStore()
  const state = reactive({ providers: store.getProviders() })
  store.subscribe(providers => (state.providers = providers))
</script>

<template>
  <div>
    <h1>Providers</h1>
    <pre>
      {{ state.providers }}
    </pre>
  </div>
</template>
