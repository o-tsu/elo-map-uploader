<template>
    <b-nav v-b-scrollspy:pool class="flex-column sticky-top" style="top:4rem;">
        <b-navbar-brand href="#">{{name.replace( /[^(A-Z)(0-9) ]/g, '' )}}</b-navbar-brand>
        <b-nav v-for="(stage) in stages" :key="`sidebar-${stage}`" pills vertical>
            <b-nav-item :href="`#elo-${stage}`">{{stage}}</b-nav-item>
            <b-nav pills vertical>
                <b-nav-item
                    v-for="(mod,index) in mods"
                    :key="index"
                    class="ml-3 my-1"
                    :href="`#elo-${stage}-${mod.join('')}`"
                >{{mod.join()}}</b-nav-item>
            </b-nav>
        </b-nav>
    </b-nav>
</template>
<script>
// const defaultValue = {
//     type: Object,
//     default: () => ({}),
// }
module.exports = {
    name: "SideScrollNav",
    props: ["id", "name", "stages", "mods"]
};
</script>



<script>
// const defaultValue = {
//     type: Object,
//     default: () => ({}),
// }
module.exports = {
    name: "SideScrollNav",
    props: ["id", "name", "stages", "mods"]
};
</script>
