import axios from 'axios'

export default class AxiosConnection {
	private static instance: AxiosConnection;

	private constructor() { }

	public static getInstance(): AxiosConnection {
		if (!AxiosConnection.instance) {
			AxiosConnection.instance = new AxiosConnection();
		}
		return AxiosConnection.instance;
	}

	private axiosInstance = axios.create({
		baseURL: this.getURL() + '/api',
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Content-type": "application/json"
		},
		timeout: 60000 // 1 minute
	});

	public getURL() {
		const PROTOCOL = document.location.protocol;
		const HOSTNAME = document.location.hostname;

		if (HOSTNAME.includes('localhost') || HOSTNAME.includes('192.168')) {
			return PROTOCOL + '//' + HOSTNAME + ':8080'; // dev
		} else {
			return 'https://dashboardapi.leovidal.es'; // server
		}
	}

	public getAxiosInstance() {
		return this.axiosInstance;
	}

	public setToken(token: string) {
		this.axiosInstance.defaults.headers.common['Authorization'] = token;
	}

	public getCancelToken() {
		return axios.CancelToken.source();
	}
}