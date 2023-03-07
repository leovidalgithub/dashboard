<template>
	<transition name="fade">
		<div class="float-button" v-if="displayingResults">
			<v-btn
				v-if="!isLoading && displayingResults"
				@click="buttonClick(false)"
				v-ripple="{ class: `green--text` }"
				color="primary"
				elevation="6"
				large
			>
				<v-icon left>
					mdi-arrow-left
				</v-icon>
				{{label}}
			</v-btn>
			<v-btn
				v-if="isLoading && displayingResults"
				@click="buttonClick(true)"
				v-ripple="{ class: `green--text` }"
				color="orange"
				elevation="6"
				large
			>
				<v-icon left>
					mdi-close-circle
				</v-icon>
				Cancel
			</v-btn>
		</div>
	</transition>
</template>

<script>
	export default {
		name: 'floatButton',
		props: {
			label: {
				type: String,
				default: 'Go back...'
			},
			displayingResults: false,
			isLoading: null
		},
		methods: {
			buttonClick(isCancel) {
				this.$emit('buttonClicked_event', isCancel)
			}
		}
	}
</script>

<style>
	.float-button {
		position: fixed;
		right: 40px;
		bottom: 70px;
		z-index: 1;
	}
	.fade-enter-active, .fade-leave-active {
		transition: opacity 1.2s;
	}
	.fade-enter, .fade-leave-to {
		opacity: 0;
	}
</style>