<template>
    <div class="py-5 row">
        <div class="col-md-2">
            <p class="text-white">2023</p>
        </div>
        <div class="col-md-4">
            <h3 class="text-white">Název</h3>
            <p class="text-white">Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas fermentum, sem in pharetra pellentesque, velit turpis volutpat ante, in pharetra metus odio a lectus.</p>
            <button @click="projectDetail">Dozvědět se více</button>
        </div>
        <div class="col-md-4">
            <img class="img-fluid" src="https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?cs=srgb&dl=pexels-pixabay-270348.jpg&fm=jpg&w=640&h=344"/>
        </div>
    </div>
</template>

<script>
export default{
    methods: {
        projectDetail() {
            this.$router.push({name: 'project'});
        }
    }
}
</script>