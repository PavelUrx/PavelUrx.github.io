<template>
 <!-- <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js App"/>-->
  <RouterView/>
  <FooterComponent></FooterComponent>
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue'
import FooterComponent from './components/FooterComponent.vue';
//import DefaultView from './views/DefaultView.vue';

export default {
  name: 'App',
  components: {
    //HelloWorld,
    //DefaultView,
    FooterComponent
  }
}
</script>
