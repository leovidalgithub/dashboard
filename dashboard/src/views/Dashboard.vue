<template>
	<div>
		<div class="text-h4 blue-grey--text text--darken-4 font-weight-medium ma-6">
			Welcome <strong>{{getUser.user}}</strong>
		</div>
	</div>
</template>

<script lang="ts">
	import Vue from 'vue'
	import { mapGetters } from 'vuex'

	export default Vue.extend({
		name: 'Dashboard',
		computed: {
			...mapGetters(['getUser'])
		}
	})
</script>