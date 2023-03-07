<template>
	<v-container>
		<div class="title my-3">
			<h1>I love Scrape</h1>
			<h2>{{getUserImage}}</h2>
		</div>
		<v-row>
			<v-col> <!-- class="shrink"  -->
				<v-card
					class="mx-auto"
					max-width="920px"
					max-height="600px"
					:loading="working"
				>
					<v-card-title>Scraper</v-card-title>

					<v-card-text>
						<v-row
							align="center"
						>
							<v-col cols="12" md="8">
								<v-select
									v-model="resources_model"
									:items="resources"
									item-text="text" item-value="value"
									label="Select a Resource"
									single-line
								></v-select>
							</v-col>
							<v-col cols="12" md="4" align="center">
								<v-btn
									outlined
									color="red"
									:disabled="working || working || !resources_model"
								>
									Refresh Media Resources
								</v-btn>
							</v-col>
						</v-row>

						<v-divider class="my-sm-8"></v-divider>

						<form @submit.prevent="searchByResourcesId">
							<v-row>
								<v-col cols="12" md="9">
									<v-text-field
										label="Let's find something"
										:rules="rules_search"
										required
										:counter="7"
										v-model="search_model"
									></v-text-field>
								</v-col>
								<v-col cols="12" md="3" align="center">
									<v-btn
										color="secondary"
										outlined
										type="submit"
										:disabled="working || !resources_model || !search_model"
									>
										Seacrh
									</v-btn>
								</v-col>
							</v-row>
						</form>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
		<v-divider class="my-8"></v-divider>
		<!-- <v-row>
			<v-col cols="12">
				<div v-for="(article, index) in data" :key="index">
					<p class="mb-0">Article # {{index + 1}}</p>
					<p class="mb-0">url = {{article.url}}</p>
					<p class="mb-0">characters count = {{article.charactersCount}}</p>
					<p class="mb-0">matches found = {{article.matchesArray.length}}</p>
					<div class="matches-paragraphs ml-16" v-for="(match, i) in article.matchesArray" :key="i">
						<p class="mb-0">Match # {{i + 1}}</p>
						<p class="mb-0" v-html="match"></p>
					</div>
				</div>
			</v-col>
		</v-row> -->
		<v-row>
			<v-bottom-navigation
				color="teal"
				grow
			>
				<v-btn>
				<span>Recents</span>

				<v-icon>mdi-history</v-icon>
				</v-btn>

				<v-btn>
				<span>Favorites</span>

				<v-icon>mdi-heart</v-icon>
				</v-btn>

				<v-btn>
				<span>Nearby</span>

				<v-icon>mdi-map-marker</v-icon>
				</v-btn>
		</v-bottom-navigation>
		</v-row>
	</v-container>
</template>

<script>
	import { mapGetters } from 'vuex';

	export default {
		name: 'Scraper',
		data() {
			return {
				resources: [],
				resources_model: null,
				search_model: null,
				working: false,
				rules_search: [
					value => !!value || 'Required.',
					value => (value && value.length >= 3) || 'Min 3 characters',
				],
				data: null
			}
		},
		created() {
		},
		methods: {
		},
		computed: {
			...mapGetters(['getUserImage'])
		}
	}
</script>

<style lang="scss">
	.matches-paragraphs {
		span {
			color: crimson;
			font-weight: 500;
			font-size: 1.2rem;
		}
	}
</style>