<template>
  <RouterView/>
  <FooterComponent></FooterComponent>
</template>

<script>
import FooterComponent from './components/FooterComponent.vue';

export default {
  name: 'App',
  components: {
    FooterComponent
  }
}
</script>
