<template>
	<div>
		<v-row>
			<v-col class="d-flex justify-center">
				<v-icon color="blue-grey darken-4">
					mdi-crosshairs
				</v-icon>
				<div class="text-h5 blue-grey--text text--darken-4 font-weight-medium">&nbsp;Search Tool</div>
			</v-col>
		</v-row>
		<v-expand-transition>
			<v-row>
				<v-col cols="12" md="10" lg="7" class="mx-auto"> <!-- class="shrink"  -->
					<v-card
						class="mx-auto"
						v-show="!displaying_results"
						:loading="loadingResources"
					>
						<v-card-title class="mt-3">Let's find something</v-card-title>
						<v-divider color="blue" class="mb-3 mx-3" ></v-divider>
						<v-card-text>
							<v-form @submit.prevent="search(false)">
								<v-row> <!-- searchText input -->
									<v-col sm="8" lg="7" class="mx-auto">
										<v-text-field
											label="Search term"
											:rules="rules_searchText"
											required dense
											v-model.trim.lazy="model.searchText"
											:autofocus="IsAutofocused"
										></v-text-field>
									</v-col>
								</v-row>
								<v-row>
									<v-col sm="8" lg="7" class="mx-auto">
										<v-row>
											<v-col cols="6" class="px-2 py-0">
												<v-select
													:items="items.langue"
													label="Language"
													v-model="model.langue"
													color="blue"
													filled
													shaped
													dense
												></v-select>
											</v-col>
											<v-col cols="6" class="px-2 py-0">
												<v-select
													:items="items.max_articles_find"
													label="Find in articles"
													v-model="model.max_articles_find"
													color="blue"
													filled
													shaped
													dense
												></v-select>
											</v-col>
											<v-col cols="6" class="px-2 py-0">
												<v-select
													:items="items.context"
													label="Context"
													v-model="model.context"
													color="blue"
													filled
													shaped
													dense
												></v-select>
											</v-col>
											<v-col cols="6" class="px-2 py-0">
												<v-select
													:items="items.paragraph_size"
													label="Paragraph size"
													v-model="model.paragraph_size"
													color="blue"
													filled
													shaped
													dense
												></v-select>
											</v-col>
										</v-row>
										<v-row class="ma-0">
											<v-col>
												<v-select
													:items="items.media_type"
													label="Article type"
													:rules="rules_mediaType"
													v-model="model.media_type"
													color="blue"
													dense
													multiple
												></v-select>
											</v-col>
										</v-row>
									</v-col>
								</v-row>
								<v-card-actions>
									<v-row>
										<v-col class="d-flex justify-center pa-0 my-3">
											<v-btn
												color="indigo"
												class="white--text text-h7 mr-3"
												v-ripple="{ class: `green--text` }"
												type="submit"
												elevation="5"
												:disabled="disabledFn"
											>
												<v-icon left>
													mdi-location-enter
												</v-icon>
												Go for it
											</v-btn>
											<v-btn
												color="primary"
												class="white--text text-h7"
												v-ripple="{ class: `green--text` }"
												@click="search(true)"
												elevation="5"
												:disabled="disabledFn"
											>
												<v-icon left>
													mdi-slot-machine-outline
												</v-icon>
												I'm lucky
											</v-btn>
										</v-col>
									</v-row>
								</v-card-actions>
							</v-form>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
		</v-expand-transition>

		<display-results
			:results="results"
			:displaying_results="displaying_results"
			:isLoading="isLoading"
			:random_search="random_search"
		></display-results>

		<floatButton
			@buttonClicked_event='buttonClicked'
			:displayingResults='displaying_results'
			:isLoading='isLoading'
		></floatButton>
	</div>
</template>

<script>
	const BACTH = 50;
	let requests = [];
	import floatButton from '@/components/float-button'
	import displayResults from '@/components/SearchTool/display-results.vue'
	import { mapActions, mapState } from 'vuex'

	import AxiosConnection from '@/global/AxiosConnection';
	const AxiosInstance = AxiosConnection.getInstance().getAxiosInstance();
	let AxiosUploadCancelTokenSource = AxiosConnection.getInstance().getCancelToken();

	export default {
		name: 'SearchTool',
		components: {
			floatButton, displayResults
		},
		data() {
			return {
				model: {
					langue: 1,
					media_type: [1,2,3],
					resources: [],
					context: 0,
					max_articles_find: 40,
					paragraph_size: 300,
					searchText: ''
				},
				items: {
					langue: [
								{
								text: 'English',
								value: 1,
								disabled: false
								},
								{
								text: 'French',
								value: 2,
								disabled: true
								},
								{
								text: 'Spanish',
								value: 3,
								disabled: true
								}
						],
					media_type: [
								{
								text: 'Text',
								value: 1,
								disabled: false
								},
								{
								text: 'Transcript',
								value: 2,
								disabled: false
								},
								{
								text: 'Video',
								value: 3,
								disabled: false
								}
						],
					max_articles_find: [10, 20, 40, 60, 100, 150, 'All'],
					context: [0, 1, 2, 3],
					paragraph_size: [
								{
								text: 'small',
								value: 200,
								disabled: false
								},
								{
								text: 'medium',
								value: 300,
								disabled: false
								},
								{
								text: 'large',
								value: 450,
								disabled: false
								}
						],
				},
				loadingResources: false,
				displaying_results: false,
				random_search: false,
				results: [],
				rules_searchText: [
					value => !!value || 'Required',
					value => (value && value.length >= 3) || 'Min 3 characters',
				],
				rules_mediaType: [
					value => value.length > 0 || 'Select at least one type',
				]
			}
		},
		created() {
			this.getAllResources();
		},
		computed: {
			...mapState({
				isLoading: state => state.isLoading
			}),
			disabledFn() {
				return this.isLoading || this.loadingResources || this.displaying_results || this.model.searchText.length < 3 || this.model.media_type.length < 1
			},
			IsAutofocused() { // inputs autofocused for tablet and desktop
				return window.innerWidth > 600;
			}
		},
		methods: {
			...mapActions(['userLogout']),
			getAllResources() {
				this.loadingResources = true;
				AxiosInstance.get('/scraper/getAllResources')
					.then(response => {
						if (response.data.statusCode == 200) {
							this.model.resources = response.data.data;
						} else {
							this.$root.$emit('dialog-alert-event', {statusCode: response.data.statusCode});
							if(response.data.statusCode == 121)
								this.userLogout();
						}
					})
					.catch((error) => {
						console.log(error)
					})
					.then(() => this.loadingResources = false); // Finally
			},
			search(random_search) { // preparing data to be sent
				let searchingArticlesQty = 0;
				this.$store.state.isLoading = true;
				this.random_search = random_search;
				this.results = [];
				requests = [];

				let info = {
					langue: this.model.langue,
					context: this.model.context,
					searchText: this.model.searchText,
					paragraph_size: this.model.paragraph_size,
				}

				this.model.resources.forEach(resource => {
					let axiosArray = [];
					let queryData = [];
					info.name = resource.name;

					if (resource.id_langue !== this.model.langue)
						return;

					this.model.media_type.forEach(mediaType => {
						if(!mediaType in resource.media_types)
							return;

						let resourceArticlesQty = resource.media_types[mediaType]['quantity'];

						if (resourceArticlesQty == 0)
							return;

						let qty = 0;

						if(random_search) { // calculating random quantity number for I'm Lucky
							const TMP_RANDOM = this.getRandomNumber();
							qty = TMP_RANDOM >= resourceArticlesQty ? resourceArticlesQty : TMP_RANDOM;
						} else {
							if(this.model.max_articles_find == 'All') {
								qty = resourceArticlesQty;
							} else {
								qty = resourceArticlesQty >= this.model.max_articles_find ? this.model.max_articles_find : resourceArticlesQty;
							}
						}

						if(qty > BACTH) {
							let batch = BACTH;
							do {
								queryData.push({
									offset: (batch - BACTH),
									limit: BACTH,
									mediaType,
									random_search
								});
								batch += BACTH;
							} while (batch < qty + BACTH);
						} else {
							queryData.push({
									offset: 0,
									limit: qty,
									mediaType,
									random_search
							})
						}
						searchingArticlesQty += qty;
					}) // model.media_type loop
					if (queryData.length > 0) {
						queryData.forEach(querydata => {
							let data = {
								resource_id: resource.id,
								info: info,
								queryData: querydata
							}
						axiosArray.push(data);
						})
					}
					this.getSearchData(axiosArray);
				}) // model.resources loop
				this.$root.$emit('dialog-alert-event', {statusCode: 301, msg: this.getPopupMsg(searchingArticlesQty)});
			},
			getSearchData(_axiosArray) {
				this.displaying_results = true;
				_axiosArray.forEach(item => {
					let requestIndex = requests.push('pending');
					item.requestIndex = requestIndex - 1; // sending the index of the requests array to know when all requests finish
					AxiosInstance.post(
										'/scraper/searchByResourcesId/',
										item,
										{cancelToken: AxiosUploadCancelTokenSource.token}
									)
						.then(response => {
							let data = response.data;
							let resource_id = data.resource_id;
							let index = this.results.findIndex(item => item.resource_id === resource_id);

							if(index >= 0) {
								let articles = this.results[index].articles.concat(data.articles);
								this.results[index].articles = articles;
							} else {
								this.results.push(data);
							}
							requests[data.requestIndex] = 'received';
							if (requests.findIndex(x => x == 'pending') == -1) { // all request responses received
								this.$store.state.isLoading = false;
							}
						})
						.catch(error => {
							this.$store.state.isLoading = false;
							if(!error.message == 'Requests canceled') // when user cancels all requests, it is catched as error, so other than that, it must display a general error msg
								this.$root.$emit('dialog-alert-event', {statusCode: 500});
						})
						.then(() => {})
					})
			},
			getRandomNumber() {
				let counter = 0, total = 0;
				this.model.resources.forEach(resource => {
					if (resource.id_langue !== this.model.langue)
						return;

					for(let r in resource.media_types) {
						let qty = resource.media_types[r].quantity;
						if(qty > 0) {
							total += qty;
							counter++;
						}
					}
				})

				if (counter > 0)
					total = Math.floor(total / counter);

				if(total > 35)
					total =	Math.floor(Math.random() * (total - 35) + 35);

				return total;
			},
			buttonClicked(isCancel) {
				if(isCancel) {
					this.$store.state.isLoading = false;
					AxiosUploadCancelTokenSource.cancel('Requests canceled');
					AxiosUploadCancelTokenSource = AxiosConnection.getInstance().getCancelToken();
				} else {
					this.displaying_results = false;
				}
			},
			getPopupMsg(searchingArticlesQty) {
				let available_resources = {};
				available_resources.total = 0;

				this.model.resources.forEach(resource => {
					this.model.media_type.forEach(mediaType => {
						if(mediaType in resource.media_types) {
							if(!available_resources[resource.media_types[mediaType].name])
								available_resources[resource.media_types[mediaType].name] = 0;
							available_resources[resource.media_types[mediaType].name] += parseInt(resource.media_types[mediaType].quantity);
							available_resources.total += parseInt(resource.media_types[mediaType].quantity);
						}
					});
				});

				return `Searching in <strong>${searchingArticlesQty.toLocaleString()}</strong> articles out of ${available_resources.total.toLocaleString()}<br>
									(available: Video: ${available_resources.video.toLocaleString()} /
									Text: ${available_resources.text.toLocaleString()} /
									Transcript: ${available_resources.transcript.toLocaleString()})`
			}
		}
	}
</script>