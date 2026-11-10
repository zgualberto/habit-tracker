import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import {
  APPLICATION_ROUTE_NAMES,
  APPLICATION_ROUTE_PATHS,
} from '@habit-tracker/contracts';

import { APPLICATION_NAME } from '../constants/application.constants';
import { PAGE_TITLES } from '../constants/page-titles.constants';
import { LOGIN_REDIRECT_QUERY_KEY } from '../constants/presentation.constants';
import { useAnalyticsStore } from '../stores/analytics.store';
import { useAuthenticationStore } from '../stores/authentication.store';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuthentication: boolean;
    pageTitle: string;
  }
}

const routeRecords: RouteRecordRaw[] = [
  {
    path: APPLICATION_ROUTE_PATHS.LOGIN,
    name: APPLICATION_ROUTE_NAMES.LOGIN,
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuthentication: false, pageTitle: PAGE_TITLES.LOGIN },
  },
  {
    path: APPLICATION_ROUTE_PATHS.REGISTRATION,
    name: APPLICATION_ROUTE_NAMES.REGISTRATION,
    component: () => import('../views/RegistrationView.vue'),
    meta: { requiresAuthentication: false, pageTitle: PAGE_TITLES.REGISTRATION },
  },
  {
    path: APPLICATION_ROUTE_PATHS.TODAY,
    name: APPLICATION_ROUTE_NAMES.TODAY,
    component: () => import('../views/TodayView.vue'),
    meta: { requiresAuthentication: true, pageTitle: PAGE_TITLES.TODAY },
  },
  {
    path: APPLICATION_ROUTE_PATHS.HABIT_CREATION,
    name: APPLICATION_ROUTE_NAMES.HABIT_CREATION,
    component: () => import('../views/HabitCreationView.vue'),
    meta: { requiresAuthentication: true, pageTitle: PAGE_TITLES.HABIT_CREATION },
  },
  {
    path: APPLICATION_ROUTE_PATHS.HABIT_DETAIL,
    name: APPLICATION_ROUTE_NAMES.HABIT_DETAIL,
    component: () => import('../views/HabitDetailView.vue'),
    meta: { requiresAuthentication: true, pageTitle: PAGE_TITLES.HABIT_DETAIL },
  },
  {
    path: APPLICATION_ROUTE_PATHS.HABIT_EDITING,
    name: APPLICATION_ROUTE_NAMES.HABIT_EDITING,
    component: () => import('../views/HabitEditingView.vue'),
    meta: { requiresAuthentication: true, pageTitle: PAGE_TITLES.HABIT_EDITING },
  },
  {
    path: APPLICATION_ROUTE_PATHS.INSIGHTS,
    name: APPLICATION_ROUTE_NAMES.INSIGHTS,
    component: () => import('../views/InsightsView.vue'),
    meta: { requiresAuthentication: true, pageTitle: PAGE_TITLES.INSIGHTS },
  },
  {
    path: APPLICATION_ROUTE_PATHS.SETTINGS,
    name: APPLICATION_ROUTE_NAMES.SETTINGS,
    component: () => import('../views/SettingsView.vue'),
    meta: { requiresAuthentication: true, pageTitle: PAGE_TITLES.SETTINGS },
  },
  {
    path: '/:pathMatch(.*)*',
    name: APPLICATION_ROUTE_NAMES.NOT_FOUND,
    component: () => import('../views/NotFoundView.vue'),
    meta: { requiresAuthentication: false, pageTitle: PAGE_TITLES.NOT_FOUND },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes: routeRecords,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach(async (to) => {
  const authenticationStore = useAuthenticationStore();
  await authenticationStore.loadCurrentUser();

  if (
    to.name === APPLICATION_ROUTE_NAMES.LOGIN ||
    to.name === APPLICATION_ROUTE_NAMES.REGISTRATION
  ) {
    if (authenticationStore.isAuthenticated) {
      return { name: APPLICATION_ROUTE_NAMES.TODAY };
    }
    return true;
  }

  if (to.meta.requiresAuthentication && !authenticationStore.isAuthenticated) {
    return {
      name: APPLICATION_ROUTE_NAMES.LOGIN,
      query: { [LOGIN_REDIRECT_QUERY_KEY]: to.fullPath },
    };
  }

  return true;
});

router.afterEach((to) => {
  document.title = `${to.meta.pageTitle} · ${APPLICATION_NAME}`;
  void useAnalyticsStore().trackPageView(to.fullPath);
});
