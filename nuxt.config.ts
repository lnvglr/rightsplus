import i18n from './config/i18n'
import postcss from './config/postcss'
// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	app: {
		pageTransition: { name: 'page', mode: 'out-in' },
		title: "RightsPlus",
		meta: [
			{ name: 'description', content: '' }
		],
	},
	pwa: {
		manifest: {
			name: 'RightsPlus',
			description: "Fluggastrechte",
			theme_color: '#f97316',
			short_name: 'RightsPlus'
		}
	},
	modules: [
		'@nuxtjs/algolia',
		'@nuxtjs/i18n',
		'@formkit/nuxt',
		'@nuxtjs/supabase',
	],
	buildModules: [
		'@nuxtjs/pwa',
	],
	nitro: {
		compressPublicAssets: true,
	},
	formkit: {
		configFile: '~/formkit.config.ts',
	},
	css: [
		'~/assets/css/main.scss',
		'~/assets/css/transitions.css',
		'@fortawesome/fontawesome-svg-core/styles.css'
	],
	i18n,
	postcss,
	runtimeConfig: {
		public: {
			google: {
				key: process.env.GOOGLE_KEY,
				placeId: process.env.GOOGLE_PLACE_ID
			},
			flight: {
				aviationstack: process.env.AVIATIONSTACK_KEY,
				flighlabs: process.env.FLIGHTLABS_KEY,
				key: process.env.APP_KEY,
				appId: process.env.APP_ID
			}
		},
	}
})
