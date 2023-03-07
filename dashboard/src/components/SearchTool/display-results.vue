<template>
	<div>
		<v-row
			v-for="resource in getOnlyResourcesWithhMatches"
			:key="resource.resource_id"
		>
			<v-col
				cols="12"
				md="11"
				lg="10"
				xl="8"
				class="mx-auto"
			>
				<v-card
					v-show="displaying_results"
					class="mx-auto white--text"
					outlined
					:loading="false"
					color="indigo"
				>
					<v-row>
						<v-col class="d-flex justify-space-between">
							<v-card-title class="text-h5">
								{{resource.info.name}}
							</v-card-title>
							<v-icon
								v-if="random_search"
								large
								color="white"
								class="mr-4 mt-3"
							>
								mdi-slot-machine-outline
							</v-icon>
						</v-col>
					</v-row>

					<v-card-subtitle class="white--text text-subtitle-1 ">
						<p>Search term: <span class="pa-2 ml-2 red--text" style="background-color: white;"><strong>{{resource.info.searchText}}</strong></span></p>
					</v-card-subtitle>
					<v-card-text>
						<articles-results-cards
							:articles="resource.articles"
							:context="resource.info.context"
						></articles-results-cards>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
		<v-row v-if="displaying_results && !isLoading && getOnlyResourcesWithhMatches.length == 0">
			<v-col
				cols="12"
				md="11"
			>
				<div class="text-h5 blue-grey--text text--darken-4 font-weight-medium">&nbsp;No result found</div>
			</v-col>
		</v-row>
	</div>
</template>

<script>
	import articlesResultsCards from './articles-results-cards.vue';

	export default {
		name: 'displayResults',
		components: {
			articlesResultsCards
		},
		props: {
			results: {
				type: Array,
				default: []
			},
			displaying_results: {
				type: Boolean,
				default: false
			},
			isLoading: {
				type: Boolean,
				default: false
			},
			random_search: {
				type: Boolean,
				default: false
			}
		},
		computed: {
			getOnlyResourcesWithhMatches() {
				return this.results.filter(r => r.articles.some(article => article.matchesFound > 0) == true)
			}
		}
	}
</script>
<style>

</style>