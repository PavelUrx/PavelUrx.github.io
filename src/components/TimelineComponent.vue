<template>
    <div class="bg-primary">
        <div class="container-sm p-5">
            <h2 class="text-center display-2 text-white">Časová osa</h2>
            <div>
                <TimelineContentComponent/>
                <TimelineContentComponent/>
                <TimelineContentComponent/>
            </div>
        </div>
    </div>
</template>

<script>
import TimelineContentComponent from './TimelineContentComponent.vue';

export default{
    components: {
        TimelineContentComponent
    }
}

//TODO load from github???
//TODO filtrování contentu
</script>