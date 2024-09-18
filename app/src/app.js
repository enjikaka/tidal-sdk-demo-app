import * as Player from '@tidal-music/player';

import * as Auth from '@tidal-music/auth';
import * as Common from '@tidal-music/common';

import './tidal-progress-bar.js';
import './tidal-current-time.js';
import './tidal-duration-time.js';

import './tidal-image.js';
import './play-trigger.js';
import './login-module.js';
import './logout-module.js';
import './media-item-row.js';
import './album-link.js';
import './album-header.js';
import './horizontal-grid.js';
import './griddy-grid.js';
import './paginator-loader.js';
import './play-queue.js';

Player.bootstrap({
  outputDevices: false,
  players: [
    {
      itemTypes: ['track', 'video'],
      player: 'shaka',
      qualities: ['HI_RES', 'LOSSLESS', 'HIGH', 'LOW'],
    }
  ]
})

function whenLoggedIn () {
  document.body.classList.add('logged-in');
}

/** @type {Promise<Common.Credentials>} */
const session = new Promise(resolve => {
  Auth.credentialsProvider.bus(async e => {
    if (e instanceof CustomEvent && e.detail.type === 'CredentialsUpdatedMessage') {
      const credentials = await Auth.credentialsProvider.getCredentials();
      const loggedIn = localStorage.getItem('loggedIn');

      if (credentials && loggedIn === 'true') {
        whenLoggedIn();
        resolve(e.detail.payload);
      }
    }
  });
});

const $ = q => document.querySelector(q);
const $$ = q => document.querySelectorAll(q);

const mainEl = document.querySelector('main');

Array.from($$('tr')).map(
  (/** @type {HTMLTableRowElement} */ tr) => tr.addEventListener(
    'dblclick',
    e => {
      // @ts-ignore
      tr.querySelector('play-trigger')?.click();
    },
    false
  )
);

document.querySelector('#toggle-playback-button').addEventListener('click', () => {
  console.log(Player.getPlaybackState());

  if (Player.getPlaybackState() === 'PLAYING') {
    Player.pause();
  } else {
    Player.play();
  }
});

/*
document.querySelector('#toggle-play-queue-button').addEventListener('click', () => {
  document.dispatchEvent(new CustomEvent('play-queue:toggle'));
});


document.querySelector('#skip-next-button').addEventListener('click', () => {
  document.dispatchEvent(new CustomEvent('play-queue:skip-next'));
});
*/

async function renderPage() {
  const path = document.location.hash.includes('#!/') ? document.location.hash.split('/').slice(1).join('/') : 'home';

  let credentials;

  if (path !== 'login') {
    credentials = await session;
  }

  mainEl.innerHTML = `Loading...`;

  const headers = new Headers();

  if (credentials) {
    headers.set('authorization', `Bearer ${credentials.token}`);
  }

  const response = await fetch('/pages/' + path, {
    headers
  });
  const html = await response.text();

  mainEl.innerHTML = html;
}

function renderError(e) {
  mainEl.innerHTML = `
    <br>
    Failed to load...
    <br><br>
    ${e}
  `;
}

function init() {
  try {
    if (
      document.location.hash === "" ||
      document.location.hash.includes('#!/')
    ) {
      renderPage().catch(renderError);
    }
  } catch (e) {
    renderError(e);
  }


  /*
  requestIdleCallback(() => {
    const tidalImage = $('tidal-image');

    if (tidalImage) {
      const firstImageSrc = tidalImage._sDOM.querySelector('img').src;

      document.body.style.backgroundImage = `url(${firstImageSrc})`;
      document.body.style.backgroundSize = `cover`;
    }
  });
  */
}

function waitForMetaDataChange() {
  const metadata = navigator.mediaSession.metadata;

  return new Promise(resolve => {
    const ic = setInterval(() => {
      if (navigator.mediaSession.metadata !== metadata) {
        resolve();
        clearInterval(ic);
      }
    }, 500);
  });
}

window.addEventListener('hashchange', init, false)
document.addEventListener('DOMContentLoaded', init, false);

Player.events.addEventListener('media-product-transition', async (/** @type {CustomEvent} */ e) => {
  const { mediaProduct, playbackContext } = e.detail;

  const credentials = await Auth.credentialsProvider.getCredentials();

  const response = await fetch(`https://openapi.tidal.com/v2/tracks/${mediaProduct.productId}?include=artists,albums&countryCode=SE`, {
    headers: new Headers({
      'authorization': `Bearer ${credentials.token}`
    })
  });
  /** @types {TrackResponse} */
  const json = await response.json();

  const artist = json.included.find(i => i.id === json.data.relationships.artists.data[0].id);
  const album = json.included.find(i => i.id === json.data.relationships.albums.data[0].id);

  const artwork = album.attributes.imageLinks.map(il => ({
    src: il.href,
    sizes: `${il.meta.width}x${il.meta.height}`,
    type: 'image/jpeg'
  }));

  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: json.data.attributes.title,
      artist: artist.attributes.name,
      album: album.attributes.title,
      artwork
    });
  }

  $('footer #artist').textContent = artist.attributes.name;
  $('footer #title').textContent = json.data.attributes.title;

  $('footer img').src = artwork[0].src;
  $('footer img').srcset = artwork.map(a => `${a.src} ${a.sizes.split('x')[0]}w`);

  const videoElement = $('footer figure video');

  if (videoElement) {
    $('footer figure').removeChild(videoElement);
  }

  if (mediaProduct.productType === 'video') {
    $('footer figure img').classList.add('hidden');

    const newVideoEl = Player.getMediaElement();

    $('footer figure').appendChild(newVideoEl);

    newVideoEl.addEventListener('click', () => {
      if (newVideoEl instanceof HTMLVideoElement) {
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture();
          newVideoEl.play();
        } else {
          newVideoEl.requestPictureInPicture();
        }
      }
    }, false)
  }

  if (mediaProduct.productType === 'track') {
    $('footer figure img').classList.remove('hidden');
  }
}, false);

Player.events.addEventListener('playback-state-change', (/** @type {CustomEvent} */e) => {
  const { state } = e.detail;

  console.log('playback-state-change', state);

  if (state === 'PLAYING') {
    $('footer').classList.remove('off-screen');
    $('footer #play-icon').classList.add('hidden');
    $('footer #pause-icon').classList.remove('hidden');
  }

  if (state === 'NOT_PLAYING') {
    const visualiser = $('audio-visualiser');

    if (visualiser) {
      visualiser.stop();
    }

    $('footer #play-icon').classList.remove('hidden');
    $('footer #pause-icon').classList.add('hidden');
  }
}, false);

const loadHandler = async () => {
  await Auth.init({
    // @ts-expect-error - Injected by esbuild
    clientId: process.env.API_CLIENT_ID,
    credentialsStorageKey: 'authorizationCode',
    scopes: [
      'playlists.read',
      'user.read',
      'recommendations.read',
      'playback',
    ],
    // @ts-expect-error - Injected by esbuild
    clientSecret: process.env.API_CLIENT_SECRET,
    clientUniqueKey: 'tidal-boombox-example'
  });

  if (window.location.search.length > 0) {
    await Auth.finalizeLogin(window.location.search);
    localStorage.setItem('loggedIn', 'true');
    window.location.replace('/');
  }

  const loggedIn = localStorage.getItem('loggedIn');

  if (loggedIn === 'true') {
    Player.setCredentialsProvider(Auth.credentialsProvider);

    Array.from($$('.logged-out-menu-item')).forEach(el => el.remove());
  } else {
    Array.from($$('.logged-in-menu-item')).forEach(el => el.remove());
  }
};

document.addEventListener('DOMContentLoaded', () => loadHandler(), false);
