<template>
    <div id="app">
        <Navbar :pools="pools" :user="user" @switch-pool="switchPool" />
        <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
        <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
        <Pool :pools="pools" :pool="pool" />
    </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
const { default: Pool } = require("./components/Pool.vue");
const { default: Navbar } = require("./components/Navbar.vue");

export default {
    name: "App",
    components: {
        // HelloWorld
        Pool,
        Navbar
    },
    data: function() {
        return {
            pools: this.$root.pools,
            user: this.$root.user,
            selectedPool: 0
        };
    },
    mounted: function() {
        this.selectedPool = this.pools[0].id;
    },
    computed: {
        pool: function() {
            return this.pools.find(pool => pool.id == this.selectedPool);
        }
    },
    methods: {
        switchPool(newPool) {
            if (this.selectedPool.id != newPool.id) {
                console.log("switch to pool", newPool);
                this.selectedPool = newPool.id;
            }
        }
    }
};
</script>

<style type="text/css">
html {
    scroll-behavior: smooth;
}
</style>
