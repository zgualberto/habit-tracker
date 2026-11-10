import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

const APPLICATION_ROOT_PATH = '/';
const NOTIFICATION_ICON_PATH = '/icon.svg';
const NOTIFICATION_BADGE_PATH = '/icon.svg';
const NOTIFICATION_TITLE_FALLBACK = 'Habit reminder';
const NOTIFICATION_BODY_FALLBACK = 'You have a habit waiting for you.';
const NOTIFICATION_TAG_FALLBACK = 'habit-reminder';
const NOTIFICATION_URL_FALLBACK = APPLICATION_ROOT_PATH;

self.skipWaiting();
self.clients.claim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event) => {
  let notificationPayload = {};

  if (event.data !== null) {
    try {
      notificationPayload = event.data.json();
    } catch {
      notificationPayload = {};
    }
  }

  const notificationTitle = notificationPayload.title ?? NOTIFICATION_TITLE_FALLBACK;
  const notificationBody = notificationPayload.body ?? NOTIFICATION_BODY_FALLBACK;
  const notificationTag = notificationPayload.tag ?? NOTIFICATION_TAG_FALLBACK;
  const notificationUrl = notificationPayload.url ?? NOTIFICATION_URL_FALLBACK;

  event.waitUntil(
    self.registration.showNotification(notificationTitle, {
      body: notificationBody,
      tag: notificationTag,
      icon: NOTIFICATION_ICON_PATH,
      badge: NOTIFICATION_BADGE_PATH,
      data: { url: notificationUrl },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ?? NOTIFICATION_URL_FALLBACK;
  const absoluteTargetUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const windowClient of windowClients) {
        if (windowClient.url === absoluteTargetUrl) {
          return windowClient.focus();
        }
      }

      return self.clients.openWindow(targetUrl);
    })(),
  );
});
