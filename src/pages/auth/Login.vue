<template>
    <v-container
            fluid
            fill-height
    >
        <v-layout
                align-center
                justify-center
        >
            <v-flex
                    xs12
                    sm8
                    md4
            >
                <auth/>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import Auth from '@/components/Auth'

    export default {
        name: 'Login',
        components: {Auth},
        created() {
            this.$store.commit('updateAppBarAndDrawer', false)
        },
        destroyed() {
            this.$store.commit('updateAppBarAndDrawer', true)
        },
    }
</script>

<style scoped>

</style>
