<template>
    <div class="py-5 row">
        <div class="col-lg-2 col-md-6 col-sm-6">
            <p class="text-secondary">{{ formattedDate(data.created_at) }}</p>
        </div>
        <div class="col-lg-4 col-md-6 col-sm-6">
            <h3 class="text-white">{{ data.name }}</h3>
            <p class="text-white">{{ data.description }}</p>
            <button @click="projectDetail" type="button" class="btn btn-secondary">Dozvědět se více</button>
        </div>
        <div class="col-lg-6 col-md-12 col-sm-12">
            <img class="img-fluid" src="https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?cs=srgb&dl=pexels-pixabay-270348.jpg&fm=jpg&w=640&h=344"/>
        </div>
    </div>
</template>

<script>
export default{
    props: {
        data: {
            type: Object,
            required: true,
        }
    },
    methods: {
        projectDetail() {
            this.$router.push({name: 'project', params: { data: this.data.name }});
        },
        formattedDate(rawDate) {
            const date = new Date(rawDate);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-indexed, so add 1)

            return `${year}-${month}`;
        }
    },

}
</script>