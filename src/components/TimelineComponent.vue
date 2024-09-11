<template>
    <div class="bg-primary">
        <div class="container-sm p-5">
            <h2 class="text-center display-2 text-white">Časová osa</h2>
            
            <div class="row rounded p-2 border">
                <p class="text-white">Nastavení osy</p>
                <div class="d-flex justify-content-between py-1">
                    <button @click="toggleSortOrder" class="btn btn-sm btn-secondary">
                        {{ getTimelineOrdering === 'asc' ? 'Sort Ascending' : 'Sort Descending' }}
                    </button>
                </div>
 
                <div class="d-flex justify-content-between">
                    <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="displayEdu" v-model="displayEducation" @change="toggleFilter('display_education')" :class="{ 'bg-secondary': displayEducation }">
                    <label class="form-check-label text-white" for="displayEdu"><small>Vzdělání</small></label>
                    </div>

                    <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="displayRepos" v-model="displayRepos" @change="toggleFilter('display_repositories')" :class="{ 'bg-secondary': displayRepos }">
                    <label class="form-check-label text-white" for="displayRepos"><small>GitHub repozitáře</small></label>
                    </div>

                    <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="displayOtherProjects" v-model="displayOtherProjects" :class="{ 'bg-secondary': displayOtherProjects }">
                    <label class="form-check-label text-white" for="displayOtherProjects"><small>Ostatní projekty</small></label>
                    </div>
                </div>

            </div>

            <div>
                <div v-if="getTimelineContent.length > 0">
                    <TimelineContentComponent  
                        v-for="repo in getTimelineContent"
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
import { mapGetters } from 'vuex';
import TimelineContentComponent from './TimelineContentComponent.vue';
import TimelineController from '@/controllers/timeline_controller';

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
        TimelineContentComponent
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
            ['getTimelineOrdering','getDisplayEducation', 'getDisplayRepositories', 'getDisplayOthers', 'getTimelineContent']
        ),
    }
}
</script>
