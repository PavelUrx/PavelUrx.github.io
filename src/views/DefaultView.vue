<template>
    <div class="bg-dark p-5">
        <div class="container-sm bg-primary p-5">
            <h1 class="text-center fw-bold display-2 text-white">PAVEL URX</h1>
            <h2 class="text-center text-secondary">Software engineer</h2>
            <p class="text-white py-5 ">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas fermentum, sem in pharetra pellentesque, velit turpis volutpat ante, in pharetra metus odio a lectus. Donec ipsum massa, ullamcorper in, auctor et, scelerisque sed, est. Curabitur sagittis hendrerit ante. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur ligula sapien, pulvinar a vestibulum quis, facilisis vel sapien. Vestibulum fermentum tortor id mi. Fusce consectetuer risus a nunc. Pellentesque sapien. 
            </p>
        </div>
    </div>
    <TimelineComponent>
    </TimelineComponent>
</template>

<script>
import TimelineComponent from '../components/TimelineComponent.vue'

export default {
    components: {
        TimelineComponent
    }
}
</script>