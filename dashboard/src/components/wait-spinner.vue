<template>
	<transition name="fade">
		<div
			class="wait-spinner"
			v-if="loading"
		>
			<v-progress-circular
				indeterminate
				color="indigo"
				size="56"
				style="margin:auto;"
			></v-progress-circular>
		</div>
	</transition>
</template>

<script>
	export default {
		name: 'waitSpinner',
		props: {
			loading: {
				type: Boolean,
				default: false
			}
		}
	}
</script>

<style lang="scss">
	.wait-spinner {
		background-color: rgb(0 0 0 / 39%);
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 1;
		display: grid;
		width: 115px;
		height: 115px;
		border-radius: 50%;
	}
	.fade-enter-active, .fade-leave-active {
		transition: opacity 1.2s;
	}
	.fade-enter, .fade-leave-to {
		opacity: 0;
	}
</style>