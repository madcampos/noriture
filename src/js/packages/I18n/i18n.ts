import type * as defaultTranslation from '../../../locales/en-US.json';
export type Messages = typeof defaultTranslation;

export const DEFAULT_LOCALE = 'en-US';
export const SUPPORT_LOCALES = [DEFAULT_LOCALE, 'pt-BR'];

export class I18n {
	static #messages = {} as unknown as Messages;

	static get locale() {
		const storageLocale = localStorage.getItem('lang');
		const documentLocale = document.querySelector('html')?.getAttribute('lang');
		const browserLocale = navigator.language;
		const locale = storageLocale ?? documentLocale ?? browserLocale;

		if (SUPPORT_LOCALES.includes(locale)) {
			return locale;
		}

		return DEFAULT_LOCALE;
	}

	static set locale(locale: string) {
		if (SUPPORT_LOCALES.includes(locale)) {
			localStorage.setItem('lang', locale);
			document.querySelector('html')?.setAttribute('lang', locale);
		}
	}

	static async #loadMessages(locale: string) {
		if (localStorage.getItem(`messages-${locale}`)) {
			return JSON.parse(localStorage.getItem(`messages-${locale}`) as string) as Messages;
		}

		const messages = await import(`../../../locales/${locale}.json`) as Messages;

		localStorage.setItem(`messages-${locale}`, JSON.stringify(messages));

		return messages;
	}

	static async init(locale?: string) {
		if (locale) {
			I18n.locale = locale;
		}

		const messages = await I18n.#loadMessages(I18n.locale);

		I18n.#messages = {
			...I18n.#messages,
			...messages
		};
	}

	static setMessage(key: string, message: string) {
		I18n.#messages[key] = message;
	}

	static t(key: string) {
		const message = I18n.#messages[key] as string | undefined;

		if (!message) {
			return key;
		}
	}
}
