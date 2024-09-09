<template>
    <div class="bg-primary">
        <div class="container-sm p-5">
            <h2 class="text-center display-2 text-white">Časová osa</h2>
            
            <div class="row">
                <p>Nastavení osy</p>
                
                <div class="d-flex justify-content-between py-1">
                    <button @click="toggleSortOrder" class="btn btn-sm btn-secondary">
                        {{ sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending' }}
                    </button>
                </div>
 
                <div class="d-flex justify-content-between">
                    <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="displayEdu" v-model="displayEducation" :class="{ 'bg-secondary': displayEducation }">
                    <label class="form-check-label" for="displayEdu">Vzdělání</label>
                    </div>

                    <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="displayRepos" v-model="displayRepos" :class="{ 'bg-secondary': displayRepos }">
                    <label class="form-check-label" for="displayRepos">GitHub repozitáře</label>
                    </div>

                    <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="displayOtherProjects" v-model="displayOtherProjects" :class="{ 'bg-secondary': displayOtherProjects }">
                    <label class="form-check-label" for="displayOtherProjects">Ostatní projekty</label>
                    </div>
                </div>

            </div>

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
            displayEducation: true,
            displayRepos: true,
            displayOtherProjects: true,
            sortOrder: 'desc',
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
    },
    methods: {
        toggleSortOrder() {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        }
    }
}
</script>
