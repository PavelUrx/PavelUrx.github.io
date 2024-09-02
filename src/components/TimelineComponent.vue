<template>
    <div class="bg-primary">
        <div class="container-sm p-5">
            <h2 class="text-center display-2 text-white">Časová osa</h2>
            <div>
                <div v-if="repositories">
                <TimelineContentComponent 
                    v-for="repo in repositories" 
                    :key="repo.id" 
                    :data="repo" 
                />
                </div>
                <div v-else>Loading...</div>
            </div>
        </div>
    </div>
</template>

<script>
import TimelineContentComponent from './TimelineContentComponent.vue';
import getRepositories from '@/helpers/timeline_helper';

export default{
    data(){
        return {
            repositories: null,
        }
    },
    components: {
        TimelineContentComponent
    },
    async mounted() {
        this.repositories = await getRepositories();
    }
}

//TODO load from github???
//TODO filtrování contentu
</script>