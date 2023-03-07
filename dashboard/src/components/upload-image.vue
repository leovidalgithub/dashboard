<template>
	<v-row justify="center">
		<v-col cols="12">
			<v-card>
				<v-card-title>Upload profile image</v-card-title>
				<v-card-text>
					<v-row>
						<v-col cols="7">
							<v-file-input
								accept="image/png, image/jpg, image/jpeg"
								label="Select Photo"
								@change="onSelect"
								ref="file"
							></v-file-input>
						</v-col>
						<v-col
							cols="5"
						>
							<v-img
								lazy-src="https://picsum.photos/id/11/10/6"
								max-height="150"
								max-width="250"
								gradient="to top right, rgba(184, 134, 11,.2), rgba(25,32,72,.2)"
								:src="getImage"
							></v-img> <!-- $refs.file.click() -->
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</v-col>
	</v-row>
</template>

<script>
	import { mapGetters } from 'vuex';

	export default {
		name: 'uploadImage',
		data() {
			return {
				userImageBase64: null
			}
		},
		methods: {
			onSelect(file) {
				this.$emit('imageChangedEvent', file);

				const reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onloadend = () => {
					this.userImageBase64 = reader.result;
				}
			}
		},
		computed: {
			...mapGetters(['getUserImage']),
			getImage() {
				return this.userImageBase64 || this.getUserImage;
			}
		}
	}
</script>