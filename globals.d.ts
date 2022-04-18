/// <reference types="vite/client" />

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

interface ImportMetaEnv {
	readonly BASE_URL: string,
	readonly MODE: 'development' | 'production',
	readonly PROD: boolean,
	readonly DEV: boolean,

	// Declared on .env file
	readonly VITE_PROXY_URL: string,
	readonly VITE_PUBLIC_URL: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
