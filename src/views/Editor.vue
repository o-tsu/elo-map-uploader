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
const { default: Pool } = require("../components/Pool.vue");
const { default: Navbar } = require("../components/Navbar.vue");

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
      api: this.$root.api,
      selectedPool: 0
    };
  },
  mounted: function() {
    this.selectedPool = this.pools[0].name;
  },
  computed: {
    pool: function() {
      return this.pools.find(pool => pool.name == this.selectedPool);
    }
  },
  methods: {
    async switchPool(newPool) {
      if (this.selectedPool.name != newPool.name) {
        console.log("switch to pool", newPool);
        this.selectedPool = newPool.name;
      }
      if (!this.pool) {
        console.log(this.api);
        // { name, host, cover, description, recommendElo }
        const name = prompt("new pool name : ");
        const host = prompt("host : ");
        const cover = prompt("cover : ");
        const description = prompt("description : ");
        const recommendElo = prompt("recommend elo : ");
        if (name) {
          this.api.createPool({
            name,
            host,
            cover,
            description,
            recommendElo
          });
          this.pools = await this.api.getPools();
        }
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
