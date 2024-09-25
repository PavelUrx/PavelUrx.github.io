<template>
    <div class="bg-primary">
        <div class="container p-5">
            <h2 class="text-center display-2 text-white">Časová osa</h2>
            
            <TimelineSettingsComponent/>

            <div>
                <div v-if="getTimelineContent.length > 0">
                    <TimelineContentComponent  
                        v-for="repo in getTimelineContent"
                        :key="repo.name" 
                        :data="repo"
                        :content_type="repo.__type"
                    />
                </div>
                <div v-else class="text-center text-white py-5">THERE IS NOTHING TO SHOW ON TIMELINE</div>
            </div>

        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import TimelineContentComponent from './TimelineContentComponent.vue';
import TimelineController from '@/controllers/timeline_controller';
import TimelineSettingsComponent from './TimelineSettingsComponent.vue';

export default {
    data() {
        return {
            timelineContent: [],
            displayEducation: true,
            displayRepos: true,
            displayOtherProjects: true,
            timelineController: null,
        }
    },
    components: {
        TimelineContentComponent,
        TimelineSettingsComponent,
    },
    async mounted() {
        var timelineController = new TimelineController();
        await timelineController.fetchRepositories();
        await timelineController.fetchEducation();
        timelineController.orderDesc();
        this.timelineContent = timelineController.getTimelineContent();
        this.$store.dispatch('updateTimelineContent', this.timelineContent);
    },
    methods: {
        toggleSortOrder() {
            this.$store.dispatch('changeTimelineOrdering');
        },
        toggleFilter(filterType) {
            this.$store.dispatch('toggleDisplayFilter', filterType);
        }
    },
    computed: {
        ...mapGetters(
            ['getTimelineOrdering', 'getTimelineContent']
        ),
    }
}
</script>
