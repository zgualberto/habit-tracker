import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { registerSW } from 'virtual:pwa-register';

import { APPLICATION_ROUTE_NAMES } from '@habit-tracker/contracts';

import App from './App.vue';
import './style.css';
import { LOGIN_REDIRECT_QUERY_KEY } from './constants/presentation.constants';
import { router } from './router';
import { setUnauthenticatedHandler } from './services/api-client';
import { useAuthenticationStore } from './stores/authentication.store';

const application = createApp(App);
const pinia = createPinia();

application.use(pinia);
application.use(router);

setUnauthenticatedHandler(() => {
  const authenticationStore = useAuthenticationStore();
  authenticationStore.clearAuthentication();

  const currentRoute = router.currentRoute.value;
  if (currentRoute.meta.requiresAuthentication) {
    void router.push({
      name: APPLICATION_ROUTE_NAMES.LOGIN,
      query: { [LOGIN_REDIRECT_QUERY_KEY]: currentRoute.fullPath },
    });
  }
});

registerSW({ immediate: true });

application.mount('#application-root');
