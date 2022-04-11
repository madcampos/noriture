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
	readonly PUBLIC_URL: PackageJsonVariables.homepage,

	readonly APP_NAME: PackageJsonVariables.displayName,
	readonly APP_SHORT_NAME: PackageJsonVariables.shortName,
	readonly APP_DESCRIPTION: PackageJsonVariables.description,
	readonly APP_KEYWORDS: string,
	readonly APP_AUTHOR: PackageJsonVariables.author.name,
	readonly APP_VERSION: PackageJsonVariables.version,

	readonly THEME_COLOR: string,
	readonly BACKGROUND_COLOR: string,

	readonly APPLE_ICON: string,
	readonly SMALL_ICON: string,
	readonly SMALL_ICON_BG: string,
	readonly LARGE_ICON: string,
	readonly LARGE_ICON_BG: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
