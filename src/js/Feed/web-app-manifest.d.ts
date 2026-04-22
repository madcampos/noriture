export type WebManifestDisplayType = 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
export type WebManifestDisplayTypeOverride = WebManifestDisplayType | 'window-controls-overlay' | 'tabbed';
export type WebManifestOrientation = 'any' | 'natural' | 'landscape' | 'landscape-primary' | 'landscape-secondary' | 'portrait' | 'portrait-primary' | 'portrait-secondary';

export type WebManifestWritingDirection = 'ltr' | 'rtl' | 'auto';

export interface WebManifestIcon {
	src: string;
	type?: string;
	sizes?: string;
	purpose?: string;
}

export interface WebManifestScreenshot {
	src: string;
	type?: string;
	sizes?: string;
	label?: string;
	platform?: string;
}

export interface WebManifestShortcut {
	name: string;
	short_name?: string;
	description?: string;
	url: string;
	icons?: WebManifestIcon[];
}

export interface WebManifestRelatedApplication {
	platform: string;
	url?: string;
	id?: string;
}

export interface WebManifest {
	id?: string;
	name?: string;
	short_name?: string;
	description?: string;
	start_url?: string;
	display?: WebManifestDisplayType;
	display_override?: WebManifestDisplayTypeOverride[];
	orientation?: WebManifestOrientation;
	theme_color?: string;
	background_color?: string;
	categories?: string[];
	icons?: WebManifestIcon[];
	screenshots?: WebManifestScreenshot[];
	shortcuts?: WebManifestShortcut[];
	related_applications?: WebManifestRelatedApplication[];
	prefer_related_applications?: boolean;
	scope?: string;
	dir?: WebManifestWritingDirection;
	lang?: string;
}
