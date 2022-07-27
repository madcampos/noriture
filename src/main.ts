import { createApp } from 'vue';

import './plugins/serviceWorker';

import router from './router';

import App from './App.vue';
import { i18n } from './plugins/i18n';

const app = createApp(App);

app.use(i18n);
app.use(router);

app.mount('#app');
