<script setup lang="ts">
  import { reactive } from 'vue'
  import { createStore } from 'mipd'

  const store = createStore()
  const state = reactive({ providers: store.getProviders() })
  store.subscribe(providers => (state.providers = providers))
</script>

<template>
  <div>
    <pre>
      {{ state.providers }}
    </pre>
  </div>
</template>
