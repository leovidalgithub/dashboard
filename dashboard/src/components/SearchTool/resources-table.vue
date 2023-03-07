<template>
	<v-row>
		<v-col>
			<v-card
				class="mx-auto"
				:loading="loading"
			>
				<v-card-title>List of Resoucres</v-card-title>

				<v-card-text>
					<v-row
						align="center"
						justify="center"
					>
						<v-col cols="12">
							<v-data-table
								:headers="headers"
								:items="resources"
								class="elevation-4"
								dense
								:disable-pagination="true"
								height="390"
								:hide-default-footer="true"
							>
							<!-- another solution > :ripple="false" instead of v-ripple -->
								<template
									v-slot:[`item.transcript`]="{ item }"
									v-ripple
								>
									<v-checkbox
										v-model="item.transcript.transcript"
										:disabled="item.transcript.disabled"
									>
									<template v-slot:label>
										<avatar-number :qty="item.transcript.quantity"></avatar-number>
									</template>
									</v-checkbox>
								</template>
								<template
									v-slot:[`item.video`]="{ item }"
									v-ripple
								>
									<v-checkbox
										v-model="item.video.video"
										:disabled="item.video.disabled"
									>
										<template v-slot:label>
											<avatar-number :qty="item.video.quantity"></avatar-number>
										</template>
									</v-checkbox>
								</template>
								<template
									v-slot:[`item.onlytext`]="{ item }"
									v-ripple
								>
									<v-checkbox
										v-model="item.onlytext.onlytext"
										:disabled="item.onlytext.disabled"
									>
										<template v-slot:label>
											<avatar-number :qty="item.onlytext.quantity"></avatar-number>
										</template>
									</v-checkbox>
								</template>
							</v-data-table>
						</v-col>
					</v-row>
					<!-- <v-divider class="my-sm-8"></v-divider> -->
				</v-card-text>
			</v-card>
		</v-col>
	</v-row>
</template>

<script>
	import avatarNumber from '@/avatar-number.vue';
	export default {
		name: 'resourcesTable',
		components: {
			avatarNumber
		},
		data() {
			return {
				headers: [
					{
						text: 'Resources',
						align: 'start',
						sortable: false,
						value: 'name',
					},
					{ text: 'Transcript', sortable: false, value: 'transcript' },
					{ text: 'Video', sortable: false, value: 'video' },
					{ text: 'Only Text', sortable: false, value: 'onlytext' },
				]
			}
		},
		props: {
			resources: {
				type: Array,
				default: []
			},
			loading: false
		}
	}
</script>