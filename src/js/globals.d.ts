/* oxlint-disable typescript/no-unsafe-function-type */

interface ImportMetaEnv {
	/** The app mode. Can be either `development` or `production`. */
	readonly MODE: 'development' | 'production';
	readonly PROD: boolean;
	readonly DEV: boolean;
}

interface ImportMeta {
	hot: {
		accept: Function,
		dispose: Function
	};
	readonly env: ImportMetaEnv;
}

declare const __brand: unique symbol;
type Brand<T, TBrand extends string> = T & { readonly [__brand]: TBrand };

interface Element {
	setHTML(input: string, options?: { sanitizer?: Sanitizer | SanitizerConfig }): void;
}
