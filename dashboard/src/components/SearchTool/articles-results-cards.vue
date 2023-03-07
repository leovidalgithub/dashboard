<template>
	<v-container class="blue-grey darken-3" fluid>
			<div class="grid">
				<v-card
					v-for="(article, index) in articles"
					:key="index" v-show="article.matchesArray.length"
					class="mx-auto grey lighten-3"
				>
					<v-card-title>{{article.mediaTitle}}</v-card-title>
					<v-card-subtitle class="red--text d-flex mt-0">
						<v-row
							dense
						>
							<v-col>
								<v-row>
									<v-col class="mb-3">
										<v-icon color="green darken-2">
											mdi-open-in-new
										</v-icon>
										<a class="green--text text--darken-2 text-subtitle-1" :href="article.url" target="_blank"> Open article</a>
									</v-col>
								</v-row>
								<p class="mb-0 text-subtitle-1">Article type: <span class="red--text"><strong>{{getMediaTypeName(article.mediaType)}}</strong></span></p>
								<p class="mb-0 text-subtitle-1">Matches found: <span class="red--text"><strong>{{article.matchesFound}}</strong></span></p>
								<p class="text-subtitle-1">Displaying context: <span class="red--text"><strong>{{context}}</strong></span></p>
							</v-col>
							<v-col>
								<v-img
									:src="article.mediaImage_url"
									lazy-src="6567058_640.png"
									max-width="220"
								>
									<template v-slot:placeholder>
										<v-row
											class="fill-height ma-0"
											align="center"
											justify="center"
										>
											<v-progress-circular
												indeterminate
												color="indigo"
											></v-progress-circular>
										</v-row>
									</template>
								</v-img>
							</v-col>
						</v-row>
					</v-card-subtitle>

					<v-card-text
						v-for="(match, i) in article.matchesArray" :key="i"
					>
						<v-divider class="mb-4"></v-divider>
						<p class="matches-paragraph" v-html="match"></p>
					</v-card-text>
				</v-card>
			</div>
	</v-container>
</template>

<script>
	export default {
		name: 'articlesResultsCards',
		props: {
			articles: {
				type: Array,
				default: []
			},
			context: {
				type: Number,
				default: 0
			}
		},
		data: () => ({
			selected: [2]
		}),
		methods: {
			getMediaTypeName(value) {
				return ['Text', 'Transcript', 'Video'][value - 1];
			}
		}
	}
</script>

<style lang="scss">
	.matches-paragraph {
		span {
			color: crimson;
			font-weight: 500;
			font-size: 1.1rem;
		}
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1em;
		@media screen and (max-width: 699px) {
			grid-template-columns: repeat(1, 1fr);
		}
	}
</style>

/*
	masonry
	.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: masonry;
		grid-auto-flow: dense;
		> * {
			break-inside: avoid;
			margin-bottom: 1em;
		}
	}
*/
