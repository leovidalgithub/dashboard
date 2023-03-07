<template>
	<div>
		<v-avatar
			:color="getColor(qty)"
			size="36"
		>
			<span class="white--text text-body-2">{{qty}}</span>
		</v-avatar>
		<!-- <v-badge
			:color="getColor(qty)"
			:content="qty"
		></v-badge> -->

	</div>
</template>

<script>
	export default {
		name: 'avatarNumber',
		props: {
			qty: {
				type: Number,
				default: 0
			}
		},
		methods: {
			getColor(qty) {
				if (qty <= 0) return 'grey lighten-1'
				else return 'green darken-1'
			}
		}
	}
</script>

<style>
</style>

<!-- using v-chip
	<template v-slot:label>
		<div>
			<v-chip
				color="red"
			>
				{{item.video.quantity}}
			</v-chip>
		</div>
	</template>
-->