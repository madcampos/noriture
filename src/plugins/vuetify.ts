// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { aliases, mdi } from 'vuetify/lib/iconsets/mdi';
import { en } from 'vuetify/locale';

// Vuetify
import { createVuetify } from 'vuetify';

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
