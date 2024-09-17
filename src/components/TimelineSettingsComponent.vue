<template>

    <div class="row py-2 bg-black">
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
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            displayEducation: true,
            displayRepos: true,
            displayOtherProjects: true,
        }
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
            ['getTimelineOrdering','getDisplayEducation', 'getDisplayRepositories', 'getDisplayOthers']
        ),
    }
}
</script>