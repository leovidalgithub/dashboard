import Vue from 'vue'
import Vuex, { createLogger } from 'vuex'
import router from '@/router'
import jwt_decode from 'jwt-decode'
import AxiosConnection from '@/global/AxiosConnection';

import {
	iUser
} from '@/interfaces/index'

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		isLoading: false,
		user:  {} as iUser,
		token: null
	},
	mutations: {
		userRegistration(state, payload) {
			state.token = payload.AUTH_TOKEN;
			state.user = payload.user;
		},
		userDeletion(state) {
			state.token = null;
			state.user = {} as iUser;
		}
	},
	actions: {
		userRegistration({commit}, payload) {
			payload.user = jwt_decode(payload.AUTH_TOKEN);
			sessionStorage.setItem('AUTH_TOKEN', payload.AUTH_TOKEN);
			AxiosConnection.getInstance().setToken(payload.AUTH_TOKEN);
			commit('userRegistration', payload);
		},
		userDeletion({commit}) {
			sessionStorage.removeItem('AUTH_TOKEN');
			AxiosConnection.getInstance().setToken('');
			commit('userDeletion');
		},
		userLogout({commit, dispatch}) {
			dispatch('userDeletion');
			router.push({name: 'Login'});
		},
		userTokenVerification({commit, dispatch}) {
			const AUTH_TOKEN = sessionStorage.getItem('AUTH_TOKEN');
			if (AUTH_TOKEN) {
				dispatch('userRegistration', {AUTH_TOKEN});
			} else {
				dispatch('userDeletion');
			}
		}
	},
	getters: {
		getToken: state => state.token,
		getUser: state => state.user,
		isAuthenticated: state => !!state.token && !!state.user,
		getUserImage: state => {
			return `${AxiosConnection.getInstance().getURL()}${state.user.image_url}`
		}
	},
	modules: {
	}
})