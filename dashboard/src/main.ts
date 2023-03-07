import Vue, {CreateElement} from 'vue'
import App from '@/views/App.vue'
import router from '@/router'
import store from '@/store'
import vuetify from '@/plugins/vuetify'

import { AppSettings, moreAppsettings } from '@/data';

Vue.config.productionTip = false

const renderers = {
	AppSettings: (h: CreateElement) =>
	h(App, {
		props: {
			rawData: AppSettings.data
			// moreAppsettings: moreAppsettings.data
		}
	})
};

new Vue({
	router,
	store,
	vuetify,
	// render: h => h(App),
	render: renderers['AppSettings']
}).$mount('#app')
