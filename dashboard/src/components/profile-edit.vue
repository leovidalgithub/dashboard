<template>
	<v-row justify="center">
		<v-dialog
			v-model="$_dialog_model"
			max-width="430px"
		>
			<v-card>
				<v-card-title>
					<span class="text-h5">User Profile</span>
				</v-card-title>
					<v-divider color="blue" class="mb-5 mx-3" ></v-divider>
					<v-form
						@submit.prevent="save"
						enctype="multipart/form-data"
					>
					<v-card-text>
						<v-container>
							<v-row class="">
								<v-col
									cols="12"
									class="py-0"
								>
									<v-text-field
										class="py-0"
										v-model="$_userName_model"
										label="User name*"
										prepend-icon="mdi-account-circle"
										required
										:autofocus="IsAutofocused"
									></v-text-field>
								</v-col>
							</v-row>
							<v-row>
								<v-col
									cols="12"
								>
									<v-text-field
										class="py-0"
										v-model="$_userEmail_model"
										label="Email*"
										prepend-icon="mdi-email"
										required
									></v-text-field>
									<small>*indicates required field</small>
								</v-col>
							</v-row>
							<v-row class="mt-0">
								<v-col cols="12">
									<upload-image
										@imageChangedEvent="imageChangedEvent"
									></upload-image>
								</v-col>
							</v-row>
						</v-container>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn
							color="indigo"
							class="white--text text-h7 mr-3"
							v-ripple="{ class: `green--text` }"
							elevation="1"
							@click="closeDialog"
							text
						>
							<v-icon left>
								mdi-arrow-left
							</v-icon>
							back
						</v-btn>
						<v-btn
							type="submit"
							color="primary"
							class="white--text text-h7"
							v-ripple="{ class: `green--text` }"
							elevation="5"
						>
							<v-icon left>
								mdi-location-enter
							</v-icon>
							Save
						</v-btn>
					</v-card-actions>
				</v-form>
			</v-card>
		</v-dialog>
	</v-row>
</template>

<script>
	import { mapActions, mapGetters } from 'vuex'
	import uploadImage from './upload-image.vue'
	import AxiosConnection from '@/global/AxiosConnection';
	const AxiosInstance = AxiosConnection.getInstance().getAxiosInstance();

	export default {
		name: 'profileEdit',
		data() {
			return {
				profileImage: null,
				userTMP: {
					name: '',
					email: ''
				}
			}
		},
			components: {
				uploadImage
			},
		props: {
			dialog_model: {
				type: Boolean,
				default: false
			},
			userName_model: {
				type: String,
				default: ''
			},
			userEmail_model: {
				type: String,
				default: ''
			}
		},
		methods: {
			...mapActions(['userRegistration']),
			closeDialog() {
				this.$emit('close-dialog', false);
			},
			imageChangedEvent(_profileImage) {
				this.profileImage = _profileImage;
			},
			save() {
				const name = this.userTMP.name || this.userName_model;
				const email = this.userTMP.email || this.userEmail_model;
				const formData = new FormData();
				formData.append('profileImage', this.profileImage);
				formData.append('id', this.getUser.id);
				formData.append('user', name);
				formData.append('email', email);
				AxiosInstance.post('/users/profileUpdate', formData)
					.then(response => {
						if (response.data.statusCode == 200) {
							this.getRefreshUserInfo();
							this.$root.$emit('dialog-alert-event', {statusCode: 301, msg: 'Profile successfully updated!', color: 'green'});
						} else {
							this.$root.$emit('dialog-alert-event', {statusCode: response.data.statusCode});
						}
					})
					.catch(err => {
						console.log('err', err);
					})
					.then(() => {
						this.closeDialog();
					})
			},
			getRefreshUserInfo() {
				AxiosInstance.get(`/users/getUser/${this.getUser.id}`)
					.then(response => {
						const AUTH_TOKEN = response.data.token;
						this.userRegistration({AUTH_TOKEN});
					})
					.catch(err => {
						console.log('err', err);
					})
					.then(() => {
						// this.closeDialog();
					})
			}
		},
		computed: {
			...mapGetters(['isAuthenticated', 'getUser']),
			$_dialog_model: {
				get: function () {
					return this.dialog_model;
				},
				set: function () {
					this.$emit('close-dialog', false);
				}
			},
			$_userName_model: {
				get: function () {
					return this.userName_model;
				},
				set: function (value) {
					this.userTMP.name = value;
				}
			},
			$_userEmail_model: {
				get: function () {
					return this.userEmail_model;
				},
				set: function (value) {
					this.userTMP.email = value;
				}
			},
			IsAutofocused() { // inputs autofocused for tablet and desktop
				return window.innerWidth > 600;
			}
		}
	}
</script>