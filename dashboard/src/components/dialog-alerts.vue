<template>
	<v-container>
		<v-dialog
			v-model="dialog_alert"
			max-width="290"
			color="inidigo"
			overlay-color="indigo"
			overlay-opacity=".25"
		>
			<v-card>
				<v-card-title class="text-h5">
					{{alerts[statusCode].title}}
				</v-card-title>

				<v-card-text>
					<p v-html="alerts[statusCode].msg"></p>
				</v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						color="indigo"
						outlined
						elevation="2"
						@click="dialog_alert = false"
					>
						Agree
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-row>
			<v-col
				sm="8" offset-sm="2"
				md="6" offset-md="2"
				lg="5" offset-lg="2"
				class="popup_alert"
			>
				<v-slide-y-reverse-transition>
					<v-alert
						v-show="popup_alert"
						:color="popup_color"
						dark
						icon="mdi-movie-search-outline"
						border="right"
						prominent
						dense
						multiline
					>
						<p v-html="alerts[statusCode].msg"></p>
					</v-alert>
				</v-slide-y-reverse-transition>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
	import { alerts } from '@/global/Alerts'

	export default {
		name: 'dialogAlerts',
		data() {
			return {
				alerts: null,
				dialog_alert: false,
				popup_alert: false,
				popup_alert_duration: 4500,
				popup_color: 'orange',
				statusCode: 500
			}
		},
		props: {
			dialog_alert_data: {
				type: Object,
				default: {}
			}
		},
		watch: {
			dialog_alert_data: {
				// immediate: true,
				// deep: true,
				handler(newValue, oldValue) {
					this.popup_alert = false;
					this.statusCode = newValue.statusCode || 500;
					const title = newValue.title ? newValue.title : '';
					const msg = newValue.msg ? newValue.msg : '';
					this.popup_color = newValue.color ? newValue.color : 'orange';

					if(!this.alerts[this.statusCode])
						this.alerts[this.statusCode] = {};

						this.alerts[this.statusCode].title = title || this.alerts[this.statusCode].title;
						this.alerts[this.statusCode].msg = msg || this.alerts[this.statusCode].msg;

						if(this.statusCode.toString().charAt(0) == 3) {
							this.popup_alert = true;
							setTimeout(() => {
								this.popup_alert = false;
							}, this.popup_alert_duration);
						} else {
							this.dialog_alert = true;
						}
				}
			}
		},
		created () {
			this.alerts = alerts;
		}
	}
</script>

<style lang="scss">
	.popup_alert {
		position: fixed;
		bottom: 60px;
		opacity: 0.9;
	}
</style>