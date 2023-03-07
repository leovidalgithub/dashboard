<template>
		<v-card>
			<v-card-title>Scraper</v-card-title>

			<v-card-text>
				<v-row>
					<v-col cols="11">
						<v-select
							item-text="text" item-value="value"
							label="Get Resources"
							single-line
						></v-select>
					</v-col>
					<v-col cols="1">
						<div style="border:1px solid red; height:50px"></div>
						<!-- <v-btn outlined color="red">
							Get
						</v-btn> -->
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
</template>

<script>
  export default {
    data: () => ({
      loading: false,
      selection: 1,
    }),

    methods: {
      reserve () {
        this.loading = true

        setTimeout(() => (this.loading = false), 2000)
      },
    },
  }
</script>