import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import AsyncComputed from 'vue-async-computed'
import { ModelSelect } from 'vue-search-select'

// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)
Vue.use(AsyncComputed)
Vue.component('vue-search-select', ModelSelect)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'vue-search-select/dist/VueSearchSelect.css'

const UniqueId = require('vue-unique-id');
Vue.use(UniqueId);

Vue.config.productionTip = false

const { MapPool } = require('elo-mappool-client');
let token = "61d14cdf3de665e07916ca92be1bc54ed59d64f03ee5145d137926fa3f8e775d67aa6ee38cf04186aa6a60e03cb0b4ebb2db808956a482cdd2258215a3034188";
let submitter = 1123053

async function start() {
    submitter = prompt("numeric osu id : ", submitter);
    token = prompt("otsu token : ", token);
    // document.cookie = cookie;
    const result = confirm(`submitter: ${submitter},
token: ${token}
continue?`)
    if (result) {
        const user = {
            id: submitter,
            token
        }
        const i = new MapPool({
            autoComplete: false,
            user
        });
        const pools = await i.getPools();
        //await Promise.all(pools.map(async pool => await pool.getMaps()))
        pools.map(pool => pool.submitter = submitter)
        new Vue({
            render: h => h(App),
            data: {
                pools,
                user
            }
        }).$mount('#app')
    }
}

start()