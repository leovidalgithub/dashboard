import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import store from '@/store'
import Dashboard from '@/views/Dashboard.vue'
import Login from '@/views/Login.vue'
import Test1 from '@/views/Test1.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
	{
		path: '/',
		name: 'Dashboard',
		component: Dashboard,
		meta: { requiresAuth: true }
	},
	{
		path: '/login',
		name: 'Login',
		component: Login,
		meta: { requiresAuth: false }
	},
	{
		path: '/test1',
		name: 'Test1',
		component: Test1,
		meta: { requiresAuth: false }
	},
	{
		path: '/searchTool',
		name: 'SearchTool',
		component: () => import('@/views/SearchTool.vue'),
		meta: { requiresAuth: true }
		// beforeEnter: (to,from,next) => {
		// 	if (store.getters.usuarioAutenticado){
		// 		next('/')
		// 	}else{
		// 	next()
		// 	}
		// }
	},
	{
		path: '*',
		redirect: { name: 'Dashboard'}
	}
]

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes
})

router.beforeEach((to, from, next) => {
	store.dispatch('userTokenVerification');

	console.log('***');

	const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
	const isAuthenticated = store.getters.isAuthenticated;

	if (requiresAuth) {
		if (isAuthenticated) {
			next();
		} else {
			next({ name: 'Login' });
		}
	} else {
		if(to.name === 'Login' && isAuthenticated) {
			next({ name: 'Dashboard' });
		} else {
			next();
		}
	}
})

export default router;