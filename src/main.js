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
import Axios from 'axios'
import router from './router'

const UniqueId = require('vue-unique-id');
Vue.use(UniqueId);

Vue.config.productionTip = false

const { MapPool } = require('elo-mappool-client');
let token = "password";
let submitter = 'exposive'
async function login() {
    submitter = prompt("account : ", submitter);
    token = prompt("password : ", token);
    // document.cookie = cookie;
    const account = await Axios({
        url: `http://otsu.fun:9529/loginByAccount`,
        data: {
            username: submitter,
            password: token
        },
        method: "POST"
    }).then(res => res.data)
    confirm(`result: ${JSON.stringify(account, null, 2)}
continue?`)
    return account
}

async function start() {
    const result = await login()
    if (result.status == -1) {
        return start()
    }
    const user = {
        id: result.data.userInfo.osuid,
        token: result.data.authorization.token
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
        router,

        data: {
            api: i,
            pools,
            user
        }
    }).$mount('#app')
}

start()