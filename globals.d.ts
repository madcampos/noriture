/// <reference types="urlpattern-polyfill" />

type Serializable = string | number | boolean | Serializable[] | { [key: string]: Serializable };

interface PackageJsonVariables {
	homepage: string,
	displayName: string,
	shortName: string,
	description: string,
	keywords: string[],
	author: {
		name: string,
		email: string
	},
	version: string,
	[key: string]: Serializable
}

interface ImportMeta {
	hot: {
		accept: Function,
		dispose: Function
	},
	env: {
		/** The app mode. Can be either `development` or `production`. */
		readonly MODE: 'development' | 'production',

		/** The project's base url. */
		readonly BASE_URL: string,
		/** The project's public url. */
		readonly PUBLIC_URL: string,
		/** The url used as a proxy for requests. */
		readonly PROXY_URL: string,

		/** The app's full name. */
		readonly APP_NAME: string,
		/** The app's short name, used for PWAs. */
		readonly APP_SHORT_NAME: string,
		/** The app's description. */
		readonly APP_DESCRIPTION: string,
		/** The app's keywords. */
		readonly APP_KEYWORDS: string,
		/** The app's author. */
		readonly APP_AUTHOR: string,
		/** The app's version */
		readonly APP_VERSION: string,

		/** The app's theme color. */
		readonly THEME_COLOR: string,
		/** The app's background color */
		readonly BACKGROUND_COLOR: string,

		/** The icon used for Apple devices. */
		readonly APPLE_ICON: string,
		/** The _small_ icon used for all other devices. */
		readonly SMALL_ICON: string,
		/** The _small_ icon used for all other devices, with maskable background. */
		readonly SMALL_ICON_BG: string,
		/** The _large_ icon used for all other devices. */
		readonly LARGE_ICON: string,
		/** The _large_ icon used for all other devices, with maskable background. */
		readonly LARGE_ICON_BG: string
	}
}
