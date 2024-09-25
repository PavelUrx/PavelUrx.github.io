<template>
    <div class="py-5 row">
        <div class="col-lg-2 col-md-6 col-sm-6">
            <div class="text-secondary d-flex justify-content-between align-items-center">
                <p class="text-white mb-0"><small>FROM</small></p>
                <p class="text-end mb-0">{{ formattDate(data.start) }}</p>
            </div>
            <div class="text-secondary d-flex justify-content-between align-items-center">
                <p class="text-white mb-0"><small>TO</small></p>
                <p class="text-end mb-0">{{ formattDate(data.end) }}</p>
            </div>
        </div>
        <div class="col-lg-8 col-md-6 col-sm-6">
            <h3 class="text-white text-center">{{ formatProjectName(data.name) }}</h3>
            <p class="text-white">{{ data.description }}</p>
            <div class="text-center">
                <button @click="projectDetail" type="button" class="btn btn-lg btn-secondary">Dozvědět se více</button>
            </div>
        </div>
        <div class="col-lg-2 col-md-12 col-sm-12 text-center timeline-icon">
            <i v-if="content_type == 'TimelineGithubModel'" class="bi bi-github py-5"></i>
            <i v-if="content_type == 'TimelineEducationModel'" class="bi bi bi-mortarboard-fill py-5"></i>
        </div>
    </div>
</template>

<script>
import '../helpers/formatting_helper.js';
import {formatDate, formatProjectName} from '../helpers/formatting_helper.js';
    

export default{
    props: {
        data: {
            type: Object,
            required: true,
        },
        content_type: {
            type: String,
            required: true
        }
    },
    methods: {
        projectDetail() {
            this.$router.push({name: 'detail', params: { data: this.data.name }});
        },
        formattDate(rawDate) {
          return formatDate(rawDate);
        },
        formatProjectName(rawName) {
            return formatProjectName(rawName);
        }
    },

}
</script>