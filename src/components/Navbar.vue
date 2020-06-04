<template>
    <b-navbar type="dark" variant="primary" sticky>
        <b-container>
            <b-navbar-brand href="#">Shit Map Editor</b-navbar-brand>
            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
            <b-collapse id="nav-collapse" is-nav>
                <!-- Right aligned nav items -->
                <b-navbar-nav class="ml-auto">
                    <b-nav-form>
                        <vue-search-select
                            style="width: 20em;"
                            size="sm"
                            v-model="pool"
                            :options="nameOfPools"
                            :serializer="s => s.text"
                            @hit="switchPool"
                        />
                        <!-- <b-button size="sm" class="my-2 my-sm-0" type="submit" @click.prevent="switchPool">Switch Pool(?)</b-button> -->
                    </b-nav-form>
                    <b-nav-item-dropdown right>
                        <!-- Using 'button-content' slot -->
                        <template slot="button-content">
                            <b-avatar variant="info" :src="avatarLink" class="mr-1"></b-avatar>
                            <em>User</em>
                        </template>
                        <b-dropdown-item href="#">Profile</b-dropdown-item>
                        <b-dropdown-item href="#">Sign Out</b-dropdown-item>
                    </b-nav-item-dropdown>
                </b-navbar-nav>
            </b-collapse>
        </b-container>
    </b-navbar>
</template>
<script>
export default {
    data() {
        return {
            pool: "",
            newPoolSymbol : Symbol('new pool').toString(),
        };
    },
    props: ["pools", "user"],
    computed: {
        nameOfPools: function() {
            if (this.pools) {
                const pools = this.pools.map(pool => ({
                    value: pool.name,
                    text: pool.name
                }));
                pools.push({
                    value: this.newPoolSymbol,
                    text: 'create new pool',
                })
                return pools;
            } else {
                return [];
            }
        },
        avatarLink: function() {
            return `https://a.ppy.sh/${this.user.id}`;
        }
    },
    watch: {
        pool: function(val) {
            console.log(val)
            this.switchPool({ value: val });
            // this.pool = ""
        }
    },
    methods: {
        switchPool(event) {
            console.log("switch-pool event", event);
            this.$emit("switch-pool", {
                name: event.value,
            });
        }
    }
};
</script>