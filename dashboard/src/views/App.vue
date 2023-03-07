<template>
	<v-app>
		<!-- drawer -->
		<v-navigation-drawer
			v-model="drawer"
			app
			temporary
			overlay-color="indigo"
			overlay-opacity=".25"
			height="calc(100% - 48px)"
		>
			<v-list
				nav
				dense
			>
				<v-list-item-group
					v-model="drawer_group_model"
					active-class="indigo--text text--accent-4"
				>
					<v-list-item>
						<v-list-item-title class="text-h5">Dashboard</v-list-item-title>
					</v-list-item>
					<router-link :to="{name: 'Dashboard'}">
						<v-list-item>
							<v-list-item-icon>
								<v-icon>mdi-home</v-icon>
							</v-list-item-icon>
							<v-list-item-title>Home</v-list-item-title>
						</v-list-item>
					</router-link>
					<v-list-item
						@click="profileEditOpen"
						:disabled="!isAuthenticated"
					>
						<v-list-item-icon>
							<v-icon>mdi-account</v-icon>
						</v-list-item-icon>
						<v-list-item-title>Profile</v-list-item-title>
					</v-list-item>

					<router-link :to="{name: 'SearchTool'}">
						<v-list-item>
							<v-list-item-icon>
								<v-icon>mdi-crosshairs</v-icon>
							</v-list-item-icon>
							<v-list-item-title>
								Search Tool
							</v-list-item-title>
						</v-list-item>
					</router-link>
				</v-list-item-group>
			</v-list>
			<template v-slot:append>
				<div class="pa-2">
				<v-btn
					v-if="isAuthenticated"
					block
					color="indigo white--text"
					@click="logout"
				>
					<v-icon left>
						mdi-logout
					</v-icon>
					Logout
				</v-btn>
				</div>
			</template>
		</v-navigation-drawer>

		<v-app-bar
			app
			color="blue-grey darken-4"
			dark
		>
			<v-app-bar-nav-icon
				@click="drawer = !drawer"
				:disabled="isLoading"
			></v-app-bar-nav-icon>
			<v-toolbar-title class="d-none d-sm-flex">
				{{currentRouteName}}
			</v-toolbar-title>

			<v-spacer></v-spacer>

			<!-- Login -->
			<v-btn
				v-if="!isAuthenticated"
				text
				outlined
				elevation="2"
				color="indigo"
				large
			>
				<router-link :to="{name: 'Login'}">Login</router-link>
			</v-btn>

			<!-- user & avatar -->
			<span v-if="isAuthenticated">
				<span>{{getUser.user}}&nbsp;&nbsp;&nbsp;</span>
				<v-avatar size="39">
					<img
						:src="getUserImage"
					>
				</v-avatar>
			</span>
		</v-app-bar>

		<!-- main router-view -->
		<v-main class="main-container mb-12">
			<v-container fluid>
				<router-view></router-view>
			</v-container>
		</v-main>

		<!-- footer bar -->
		<v-footer
			padless
			class="indigo white--text"
			fixed
		>
			<v-col
				class="text-center"
				cols="12"
			>
			{{ new Date().getFullYear() }} — <strong>Dashboard</strong>
			</v-col>
		</v-footer>

		<!-- general components -->
		<wait-spinner
			:loading="isLoading"
		></wait-spinner>

		<dialog-alerts
			:dialog_alert_data="dialog_alert_data"
		></dialog-alerts>

		<profile-edit
			v-if="dialog_profile"
			:dialog_model="dialog_profile"
			@close-dialog="update_profile_close"
			v-bind:userName_model="getUser.user"
			v-bind:userEmail_model="getUser.email"
		></profile-edit>
	</v-app>
</template>

<script lang="ts">
	import Vue from 'vue';
	import { mapActions, mapGetters, mapState } from 'vuex';
	import waitSpinner from '../components/wait-spinner.vue';
	import dialogAlerts from '../components/dialog-alerts.vue'
	import profileEdit from '../components/profile-edit.vue'

	export default Vue.extend({
		name: 'App',
		components: {
			waitSpinner,
			dialogAlerts,
			profileEdit
		},
		props: {
			rawData: {
				type: Object,
				default: {}
			}
		},
		data: () => ({
			dialog_profile: false,
			drawer: null,
			dialog_alert_data: null,
			drawer_group_model: null,
		}),
		computed: {
			...mapState(['isLoading']),
			...mapGetters(['isAuthenticated', 'getUser', 'getUserImage']),
			currentRouteName() {
				const activeRoute: string = this.$route.name!;
				return activeRoute;
			}
		},
		methods: {
			...mapActions({
				logout: 'userLogout', // map `this.logout()` to `this.$store.dispatch('userLogout')`
				userTokenVerification: 'userTokenVerification'
			}),
			update_profile_close(state: boolean) {
				this.dialog_profile = state;
			},
			profileEditOpen() {
				this.userTokenVerification();
				if (!this.isAuthenticated) {
					this.logout();
				} else {
					this.dialog_profile = true;
				}
			}
		},
		created () {
			this.$root.$on('dialog-alert-event', (e: any) => { // dialog-alerts event mounted on memory
				this.dialog_alert_data = e;
			});
		}
	})
</script>

<style lang="scss">
	.main-container {
		background-color: #dadada;
	}
	a {
		color: white !important;
		text-decoration: none;
	}
	.router-link-exact-active {
		color: #6b80f8 !important;
	}
</style>