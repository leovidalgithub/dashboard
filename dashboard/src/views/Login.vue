<template>
	<v-card max-width="450" class="mx-auto mt-9">
		<v-card-title>{{ loginMode ? 'Login' : 'Register new User' }}</v-card-title>
			<v-form
				@submit.prevent="login"
				ref="loginForm"
			>
				<v-card-text>
					<v-text-field
						v-model.trim="user_model.email"
						:rules="emailRules"
						label="Email"
						prepend-icon="mdi-email"
						:autofocus="IsAutofocused"
						required
					/>
					<v-text-field
						v-if="!loginMode"
						v-model.trim="user_model.user"
						:rules="nameRules"
						label="Username"
						prepend-icon="mdi-account-circle"
					/>
					<v-text-field
						v-model.trim="user_model.pass"
						:rules="passRules"
						label="Password"
						:type="showPassword ? 'text' : 'password'"
						prepend-icon="mdi-lock"
						:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
						@click:append="showPassword = !showPassword"
					/>
					<v-text-field
						v-if="!loginMode"
						v-model.trim="user_model.pass2"
						:rules="passRules"
						label="Repeat Password"
						:type="showPassword ? 'text' : 'password'"
						prepend-icon="mdi-lock"
						:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
						@click:append="showPassword = !showPassword"
					/>
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions>
					<v-btn
						@click="loginMode = !loginMode"
						color="indigo"
						elevation="1"
						text
					>
						<v-icon left>
							{{ loginMode ? 'mdi-account-plus' : 'mdi-login-variant' }}
						</v-icon>
						{{ loginMode ? 'Register new User' : 'Login' }}
					</v-btn>
					<v-spacer></v-spacer>
					<v-btn
						type="submit"
						color="primary"
					>
						<v-icon left>
							{{ loginMode ? 'mdi-login-variant' : 'mdi-account-plus' }}
						</v-icon>
						{{ loginMode ? 'Login' : 'Register' }}
					</v-btn>
				</v-card-actions>
			</v-form>
	</v-card>
</template>

<script>
	import { mapActions, mapGetters } from 'vuex';
	import router from '@/router'
	import AxiosConnection from '@/global/AxiosConnection';
	const AxiosInstance = AxiosConnection.getInstance().getAxiosInstance();

	export default {
		name: 'Login',
		data() {
			return {
				loginMode: true,
				showPassword: false,
				user_model: {
					user: '',
					email: '',
					pass: '',
					pass2: ''
				},
				nameRules: [
					v => !!v || 'Name is required',
					v => v.length >= 4 || 'Name must be at least 4 characters',
				],
				emailRules: [
					v => !!v || 'E-mail is required',
					v => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'Email must be valid',
				],
				passRules: [
					v => !!v || 'Password is required',
					v => v.length >= 6 || 'Password must be at least 6 characters',
				]
			}
		},
		methods: {
			...mapActions(['userRegistration']),
			login() {
				if (!this.$refs.loginForm.validate())
					return;

				if(!this.loginMode && this.user_model.pass != this.user_model.pass2) {
					this.$root.$emit('dialog-alert-event', {statusCode: 101});
					return;
				}

				const endpoint = this.loginMode ? 'login' : 'register'; // either Login or Register a new user
				AxiosInstance.post('users/' + endpoint, this.user_model)
					.then(response => {
						if (response.data.statusCode == 200) {
							const AUTH_TOKEN = response.data.token;
							this.userRegistration({AUTH_TOKEN});
							router.push({name: 'Dashboard'});
						} else {
							this.$root.$emit('dialog-alert-event', {statusCode: response.data.statusCode});
						}
					})
					.catch(err => {
						console.log('err', err);
					})
			}
		},
		computed: {
			...mapGetters(['getToken']),
			IsAutofocused() { // inputs autofocused for tablet and desktop
				return window.innerWidth > 600;
			}
		}
	}
</script>