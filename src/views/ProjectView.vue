<template>
    <div class="vh-100 bg-dark p-5">
        <div class="container-sm bg-primary p-5">
            <h1 class="text-center fw-bold display-2 text-white">NÁZEV PROJEKTU</h1>
            <h2>Myšlenka..</h2>
            <p class="text-white py-5 ">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas fermentum, sem in pharetra pellentesque, velit turpis volutpat ante, in pharetra metus odio a lectus. Donec ipsum massa, ullamcorper in, auctor et, scelerisque sed, est. Curabitur sagittis hendrerit ante. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur ligula sapien, pulvinar a vestibulum quis, facilisis vel sapien. Vestibulum fermentum tortor id mi. Fusce consectetuer risus a nunc. Pellentesque sapien. 
            </p>
        </div>
    </div>
    <div class="text-center">
        <button @click="back">Zpět</button>
    </div>
</template>

<script>
export default{
    methods: {
        back() {
            this.$router.push({name: 'home'});
        }
    }
}
</script>