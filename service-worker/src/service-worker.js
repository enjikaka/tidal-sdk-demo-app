/* eslint-env worker */
// @ts-expect-error - Global workbox variable
__WB_DISABLE_DEV_LOGS = true;

import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { precacheAndRoute } from 'workbox-precaching';

import { homeRouteHandler } from './routes/home.js';
import { playlistRouteHandler } from './routes/playlist.js';
import { myMixesRouteHandler } from './routes/myMixes.js';
import { myPlaylistsRouteHandler } from './routes/myPlaylists.js';
import { searchRouteHandler } from './routes/search.js';
import { loginRouteHandler } from './routes/login.js';
import { logoutRouteHandler } from './routes/logout.js';

import "urlpattern-polyfill";

// @ts-expect-error - Workbox variable
precacheAndRoute(self.__WB_MANIFEST);

async function pagesRouteHandler(details) {
  const pattern1 = new URLPattern({ pathname: '/pages/:page/:subpage?' });
  const pattern2 = new URLPattern({ pathname: '/pages/:page/:subpage?/' });

  const match1 = pattern1.exec(details.url);
  const match2 = pattern2.exec(details.url);

  if (match1 || match2) {
    const match = match1 || match2;

    switch (match.pathname.groups.page) {
      case 'home':
        return homeRouteHandler(details.request);
      case 'playlists':
        return playlistRouteHandler(details.request);
      case 'my-mixes':
        return myMixesRouteHandler(details.request);
      case 'my-playlists':
        return myPlaylistsRouteHandler(details.request);
      case 'search':
        return searchRouteHandler(details.request);
      case 'login':
        return loginRouteHandler(details.request);
      case 'logout':
        return logoutRouteHandler(details.request);
      default:
        console.log('404 Page Not Found');
        break;
    }
  } else {
    return new Response(
      null,
      {
        status: 404
      }
    );
  }
}

registerRoute(
  ({ request }) => request.url.includes('/pages/'),
  async details => pagesRouteHandler(details)
);

// @ts-expect-error - Types are weird...
self.skipWaiting();
clientsClaim();
