<template>
    <div class="bg-primary py-2">
        <div class="container py-2">
            <h1 class="text-start fw-bold display-2 text-white">{{ formatToUppercase(formatProjectName(data)) }}</h1>
        </div>
    </div>
    <div class="container py-5">
        <div class="bg-white corners p-5">
            <div class="top left border-secondary"></div>
            <div class="bottom right border-secondary"></div>
            <div class="container">
                <h2>Myšlenka..</h2>
                <p class="py-5">
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas fermentum, sem in pharetra pellentesque, velit turpis volutpat ante, in pharetra metus odio a lectus. Donec ipsum massa, ullamcorper in, auctor et, scelerisque sed, est. Curabitur sagittis hendrerit ante. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur ligula sapien, pulvinar a vestibulum quis, facilisis vel sapien. Vestibulum fermentum tortor id mi. Fusce consectetuer risus a nunc. Pellentesque sapien. 
                </p>
            </div>
        </div>

        <div class="bg-white corners p-5">
            <div class="top left border-secondary"></div>
            <div class="bottom right border-secondary"></div>
            <div class="container">
                <h2>Dále..</h2>
                <p class="py-5">
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas fermentum, sem in pharetra pellentesque, velit turpis volutpat ante, in pharetra metus odio a lectus. Donec ipsum massa, ullamcorper in, auctor et, scelerisque sed, est. Curabitur sagittis hendrerit ante. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur ligula sapien, pulvinar a vestibulum quis, facilisis vel sapien. Vestibulum fermentum tortor id mi. Fusce consectetuer risus a nunc. Pellentesque sapien. 
                </p>
            </div>
        </div>

    </div>
    <div class="floating p-4">
        <button @click="back" class="btn btn-lg btn-secondary"><i class="bi bi-arrow-left"></i></button>
    </div>

</template>

<script>
import {formatProjectName, formatToUppercase} from '../helpers/formatting_helper.js';

export default{
    methods: {
        back() {
            this.$router.push({name: 'home'});
        },
        formatProjectName(rawName) {
            return formatProjectName(rawName);
        },
        formatToUppercase(text) {
            return formatToUppercase(text);
        }
    },
    computed: {
    data() {
        return this.$route.params.data;
    }
  }
}
</script>
