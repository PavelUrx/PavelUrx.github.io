<template>
    <div class="p-5 wrapper vh-100" id="scene">
        <div class="container corners p-5">
            <div class="top left border-white"></div>
            <div class="bottom right border-white"></div>
            <div class=" bg-primary p-5 bg-opacity-75">
                <h1 class="text-center fw-bold display-2 text-white">PAVEL URX</h1>
                <h2 class="text-center text-secondary">Software engineer</h2>
                <p class="text-white py-5 ">Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas fermentum, sem in pharetra pellentesque, 
                    velit turpis volutpat ante, in pharetra metus odio a lectus.</p>
            </div>
           
        </div>
    </div>
    <TimelineComponent>
    </TimelineComponent>
</template>

<script>
import TimelineComponent from '../components/TimelineComponent.vue'
import HomeScene from '../others/home_scene.js';

export default {
    components: {
        TimelineComponent
    },
    mounted() {
        const homeScene = new HomeScene('scene');
        homeScene.start();
    }
}

</script>

<style>
.wrapper {
    position: relative;
}

.three-scene {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
}
</style>