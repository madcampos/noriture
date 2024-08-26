/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
	/** The app mode. Can be either `development` or `production`. */
	readonly MODE: 'development' | 'production';
	readonly PROD: boolean;
	readonly DEV: boolean;

	/** The proxy url to use. */
	readonly APP_PROXY_URL: string;
}

interface ImportMeta {
	hot: {
		accept: Function,
		dispose: Function
	};
	readonly env: ImportMetaEnv;
}
