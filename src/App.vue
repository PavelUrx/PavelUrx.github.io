<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="shell">
    <RouterView />
  </div>
</template>

<style scoped>
.shell {
  min-height: 100%;
  min-height: 100dvh;
  min-height: 0;
  overflow-x: hidden;
}
</style>
