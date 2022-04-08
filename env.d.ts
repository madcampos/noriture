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
		version,
	[key: string]: Serializable
}
