export type EnabledDisabledSetting = 'disabled' | 'enabled';

export const AVAILABLE_FONTS = {
	'Browser Default': 'browser',
	'Comic Sans': 'comic-sans',
	'App Default': 'default',
	'Legibility': 'legibility'
} as const;
export type FontSetting = typeof AVAILABLE_FONTS[keyof typeof AVAILABLE_FONTS];

export const AVAILABLE_FONT_SIZES = {
	'Extra Large': 'x-large',
	'Large': 'large',
	'Medium': 'medium',
	'Small': 'small',
	'Extra Small': 'x-small'
} as const;
export type FontSizeSetting = typeof AVAILABLE_FONT_SIZES[keyof typeof AVAILABLE_FONT_SIZES];

export const AVAILABLE_LINE_HEIGHTS = {
	Tight: 'tight',
	Medium: 'medium',
	Wide: 'wide',
	Wider: 'wider'
} as const;
export type LineHeightSetting = typeof AVAILABLE_LINE_HEIGHTS[keyof typeof AVAILABLE_LINE_HEIGHTS];

export const AVAILABLE_LETTER_SPACINGS = {
	Tighter: 'tighter',
	Tight: 'tight',
	Medium: 'medium',
	Wide: 'wide',
	Wider: 'wider'
} as const;
export type LetterSpacingSetting = typeof AVAILABLE_LETTER_SPACINGS[keyof typeof AVAILABLE_LETTER_SPACINGS];

export const AVAILABLE_BORDER_WIDTHS = {
	None: 'none',
	Thin: 'thin',
	Medium: 'medium',
	Thick: 'thick',
	Thicker: 'thicker'
} as const;
export type BorderWidthSetting = typeof AVAILABLE_BORDER_WIDTHS[keyof typeof AVAILABLE_BORDER_WIDTHS];

/* oxlint-disable @typescript-eslint/no-magic-numbers */
export const DEFAULT_REFRESH_RATE_LIST = {
	'5 Minutes': 60 * 5,
	'10 Minutes': 60 * 10,
	'15 Minutes': 60 * 15,
	'30 Minutes': 60 * 30,
	'1 Hour': 60 * 60,
	'2 Hours': 60 * 60 * 2,
	'6 Hours': 60 * 60 * 6,
	'12 Hours': 60 * 60 * 12,
	'1 Day': 60 * 60 * 24,
	'1 Week': 60 * 60 * 24 * 7,
	'2 weeks': 60 * 60 * 24 * 14,
	'1 Month': 60 * 60 * 24 * 30,
	'Manually': -1
} as const;
/* oxlint-enable @typescript-eslint/no-magic-numbers */
export type RefreshRate = keyof typeof DEFAULT_REFRESH_RATE_LIST;

export class Settings {
	static AVAILABLE_SETTINGS = [
		'debug',
		'updateUrl',
		'refreshRate',
		'lastUpdate',
		'lang',
		'isReducedMotion',
		'hasSolidBorders',
		'borderWidth',
		'readingVoice',
		'readingSpeed',
		'font',
		'fontSize',
		'letterSpacing',
		'lineHeight'
	] as const;

	static #searchParams?: URLSearchParams;

	static #isInitialized = false;

	static initializeSettings() {
		if (Settings.#searchParams || Settings.#isInitialized) {
			return;
		}

		this.#isInitialized = true;

		Settings.#searchParams = new URLSearchParams(document.location.search);

		for (const setting of Settings.AVAILABLE_SETTINGS) {
			Settings.#updateSetting(setting, Settings[setting]?.toString());
		}
	}

	// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
	static #getSetting<T extends string>(setting: typeof Settings.AVAILABLE_SETTINGS[number]) {
		if (!this.#isInitialized) {
			Settings.initializeSettings();
		}

		// oxlint-disable-next-line typescript/no-unsafe-type-assertion, typescript/consistent-type-assertions
		return (Settings.#searchParams?.get(setting) ?? localStorage.getItem(setting) ?? undefined) as T | undefined;
	}

	static #updateSetting(setting: typeof Settings.AVAILABLE_SETTINGS[number], value: string | undefined) {
		if (!this.#isInitialized) {
			Settings.initializeSettings();
		}

		if (value) {
			document.documentElement.dataset[setting] = value;
			Settings.#searchParams?.set(setting, value);

			localStorage.setItem(setting, value);
		} else {
			// oxlint-disable-next-line typescript/no-dynamic-delete
			delete document.documentElement.dataset[setting];
			Settings.#searchParams?.delete(setting);
			localStorage.removeItem(setting);
		}

		const shouldUpdateUrl = Settings.debug || Settings.updateUrl;
		const hasSearchParams = Settings.#searchParams !== undefined && Settings.#searchParams.size > 0;

		if (shouldUpdateUrl && hasSearchParams) {
			const newUrl = new URL(document.location.href);

			newUrl.search = Settings.#searchParams?.toString() ?? '';
			history.replaceState(null, '', newUrl);
		}
	}

	// #region Debug options
	static get updateUrl(): boolean {
		return Settings.#getSetting('updateUrl') === 'true';
	}

	static set updateUrl(value: boolean | undefined) {
		Settings.#updateSetting('updateUrl', value ? 'true' : 'false');
	}

	static get debug(): boolean {
		return Settings.#getSetting('debug') === 'true';
	}

	static set debug(value: boolean | undefined) {
		Settings.#updateSetting('debug', value ? 'true' : 'false');
	}
	// #endregion

	// #region Refresh Rate
	static get refreshRate(): RefreshRate {
		return Settings.#getSetting<RefreshRate>('refreshRate') ?? '1 Day';
	}

	static set refreshRate(value: string) {
		if (Object.keys(DEFAULT_REFRESH_RATE_LIST).includes(value)) {
			Settings.#updateSetting('refreshRate', value);
		} else {
			Settings.#updateSetting('refreshRate', '1 Day' satisfies RefreshRate);
		}
	}

	// oxlint-disable-next-line typescript/related-getter-setter-pairs
	static get lastUpdate(): Date | undefined {
		const existingDate = Settings.#getSetting('lastUpdate');

		if (existingDate) {
			return new Date(existingDate);
		}

		return undefined;
	}

	static set lastUpdate(value: Date) {
		Settings.#updateSetting('lastUpdate', value.toISOString());
	}
	// #endregion

	// #region Language
	static get lang() {
		return Settings.#getSetting('lang') ?? document.body.lang;
	}

	static set lang(value) {
		Settings.#updateSetting('lang', value);
	}
	// #endregion

	// #region Accessibility
	static get isReducedMotion(): EnabledDisabledSetting {
		const setting = Settings.#getSetting<EnabledDisabledSetting>('isReducedMotion');

		if (setting !== undefined) {
			return setting;
		}

		return 'disabled';
	}

	static set isReducedMotion(value: EnabledDisabledSetting | undefined) {
		Settings.#updateSetting('isReducedMotion', value);
	}

	static get hasSolidBorders(): EnabledDisabledSetting {
		const setting = Settings.#getSetting<EnabledDisabledSetting>('hasSolidBorders');

		if (setting !== undefined) {
			return setting;
		}

		return 'disabled';
	}

	static set hasSolidBorders(value: EnabledDisabledSetting | undefined) {
		Settings.#updateSetting('hasSolidBorders', value);
	}

	static get borderWidth(): BorderWidthSetting {
		const setting = Settings.#getSetting<BorderWidthSetting>('borderWidth');

		if (setting !== undefined) {
			return setting;
		}

		return 'medium';
	}

	static set borderWidth(value: BorderWidthSetting | undefined) {
		Settings.#updateSetting('borderWidth', value);
	}
	// #endregion

	// #region Reading
	static get readingVoice() {
		return Settings.#getSetting('readingVoice');
	}

	static set readingVoice(value) {
		Settings.#updateSetting('readingVoice', value);
	}

	static get readingSpeed(): number {
		return Number.parseFloat(Settings.#getSetting('readingSpeed') ?? '1');
	}

	static set readingSpeed(value: number | undefined) {
		Settings.#updateSetting('readingSpeed', value !== undefined ? value.toString() : undefined);
	}
	// #endregion

	// #region Font and Text
	static get font(): FontSetting {
		return Settings.#getSetting<FontSetting>('font') ?? 'default';
	}

	static set font(value: FontSetting | undefined) {
		Settings.#updateSetting('font', value);
	}

	static get fontSize(): FontSizeSetting {
		return Settings.#getSetting<FontSizeSetting>('fontSize') ?? 'medium';
	}

	static set fontSize(value: FontSizeSetting | undefined) {
		Settings.#updateSetting('fontSize', value);
	}

	static get letterSpacing(): LetterSpacingSetting {
		return Settings.#getSetting<LetterSpacingSetting>('letterSpacing') ?? 'medium';
	}

	static set letterSpacing(value: LetterSpacingSetting | undefined) {
		Settings.#updateSetting('letterSpacing', value);
	}

	static get lineHeight(): LineHeightSetting {
		return Settings.#getSetting<LineHeightSetting>('lineHeight') ?? 'medium';
	}

	static set lineHeight(value: LineHeightSetting | undefined) {
		Settings.#updateSetting('lineHeight', value);
	}
	// #endregion
}

Settings.initializeSettings();
