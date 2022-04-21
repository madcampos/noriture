import { nextTick, watch } from 'vue';
import { createI18n, type I18n, type I18nOptions, type IntlDateTimeFormats } from 'vue-i18n';

import * as defaultTranslation from '../locales/en.json';

export type Messages = typeof defaultTranslation.messages;
export const DEFAULT_LOCALE = 'en';
export const SUPPORT_LOCALES = [DEFAULT_LOCALE, 'pt-BR'];

const options: I18nOptions = {
	locale: DEFAULT_LOCALE,
	fallbackLocale: DEFAULT_LOCALE,
	globalInjection: true,
	legacy: false,
	messages: {
		[DEFAULT_LOCALE]: defaultTranslation.messages
	},
	datetimeFormats: {
		[DEFAULT_LOCALE]: defaultTranslation.datetimeFormats as IntlDateTimeFormats
	}
};

export const i18n = createI18n(options) as unknown as I18n<Messages, typeof defaultTranslation.datetimeFormats, {}, false>;

export function useLocale() {
	const storageLocale = localStorage.getItem('lang');
	const documentLanguage = document.querySelector('html')?.getAttribute('lang');
	const userLanguage = navigator.language;
	const loadedLanguage = storageLocale ?? documentLanguage ?? userLanguage;

	if (SUPPORT_LOCALES.includes(loadedLanguage)) {
		i18n.global.locale.value = loadedLanguage;
	} else {
		document.querySelector('html')?.setAttribute('lang', i18n.global.locale.value);
		localStorage.setItem('lang', i18n.global.locale.value);
	}

	watch(i18n.global.locale, () => {
		document.querySelector('html')?.setAttribute('lang', i18n.global.locale.value);
		localStorage.setItem('lang', i18n.global.locale.value);
	});

	return i18n.global.locale;
}

export async function loadLocaleMessages(locale: string) {
	// Load locale messages with dynamic import
	const messages = await import(`../../locales/${locale}.json`);

	// Set locale and locale message
	i18n.global.setLocaleMessage(locale, messages.default);

	return nextTick();
}
