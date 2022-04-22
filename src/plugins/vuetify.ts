// Styles
import '@fontsource/roboto';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

// Vuetify
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/lib/iconsets/mdi';
import { en } from 'vuetify/locale';

export default createVuetify({
	theme: {
		defaultTheme: 'dark'
	},
	icons: {
		defaultSet: 'mdi',
		aliases,
		sets: {
			mdi
		}
	},
	locale: {
		defaultLocale: 'en',
		fallbackLocale: 'en',
		messages: { en }
	}
});
