<template>
    <div class="bg-primary">
        <div class="container-sm p-5">
            <h2 class="text-center display-2 text-white">Časová osa</h2>
            <div>
                <div v-if="repositories.length > 0">
                    <TimelineContentComponent 
                        v-for="repo in repositories" 
                        :key="repo.name" 
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
import TimelineController from '@/controllers/timeline_controller';

export default {
    data() {
        return {
            repositories: [],
        }
    },
    components: {
        TimelineContentComponent
    },
    async mounted() {
        var timelineController = new TimelineController();
        await timelineController.fetchRepositories();
        await timelineController.fetchEducation();
        timelineController.orderByStart();
        this.repositories = timelineController.getTimelineContent();
    }
}
</script>
