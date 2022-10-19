import './plugins/serviceWorker';
import { I18n } from './packages/I18n/i18n';
import './router/index';
import { Router } from './router/router';

(async () => {
	await I18n.init();

	document.querySelector('#config-button')?.addEventListener('click', () => {
		void Router.navigate('/add-feed');
	});
})();
