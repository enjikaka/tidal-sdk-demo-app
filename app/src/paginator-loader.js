import { html, itemToAlbumLink, itemToMediaItemRow, stringToElements } from './helpers.js';

import './griddy-grid.js';

/**
 *
 * @param {'tracks'|'videos'|'albums'|'playlists'|'artists'} type
 */
async function* fetchFavorite(type) {
  let fetchCount = 0;

  const userId = await getUserId();
  const response = await tidalFetch(
    `/users/${userId}/favorites/${type}?offset=0&limit=50&order=DATE&orderDirection=DESC`
  );
  const totalNumberOfItems = parseInt(response.headers.get('X-Total-Number-Of-Items'), 10);
  const text = await response.text();

  yield text;
  fetchCount += 50;

  while (fetchCount !== totalNumberOfItems) {
    const response = await tidalFetch(
      `/users/${userId}/favorites/${type}?offset=${fetchCount}&limit=50&order=DATE&orderDirection=DESC`
    );
    const text = await response.text();

    yield text;
    fetchCount += 50;
  }
}

async function* fetchMyPlaylists() {
  let fetchCount = 0;

  const userId = await getUserId();
  const response = await tidalFetch(
    `/users/${userId}/playlistsAndFavoritePlaylists?offset=0&limit=50&order=DATE&orderDirection=DESC`
  );
  const totalNumberOfItems = parseInt(response.headers.get('X-Total-Number-Of-Items'), 10);
  const text = await response.text();

  yield text;
  fetchCount += 50;

  while (fetchCount !== totalNumberOfItems) {
    const response = await tidalFetch(
      `/users/${userId}/playlistsAndFavoritePlaylists?offset=${fetchCount}&limit=50&order=DATE&orderDirection=DESC`
    );
    const text = await response.text();

    yield text;
    fetchCount += 50;
  }
}

async function* fetchPlaylistItems(playlistId) {
  let fetchCount = 0;

  const response = await tidalFetch(
    `/playlists/${playlistId}/items?offset=0&limit=50`
  );
  const totalNumberOfItems = parseInt(response.headers.get('X-Total-Number-Of-Items'), 10);
  const text = await response.text();

  yield text;
  fetchCount += 50;

  while (fetchCount !== totalNumberOfItems) {
    const response = await tidalFetch(
      `/playlists/${playlistId}/items?offset=${fetchCount}&limit=50`
    );
    const text = await response.text();

    yield text;
    fetchCount += 50;
  }
}

class PaginatorLoader extends HTMLElement {
  constructor() {
    super();

    this._collection = null;
    this._keepAppending = true;
  }

  async fetchCollection() {
    const desiredCollection = this.getAttribute('collection');

    if (desiredCollection === 'my-tracks') {
      this._collection = await fetchFavorite('tracks');
    }

    if (desiredCollection === 'my-albums') {
      this._collection = await fetchFavorite('albums');
    }

    if (desiredCollection === 'my-videos') {
      this._collection = await fetchFavorite('videos');
    }

    if (desiredCollection === 'my-artists') {
      this._collection = await fetchFavorite('artists');
    }

    if (desiredCollection === 'my-playlists') {
      this._collection = await fetchMyPlaylists();
    }

    if (desiredCollection.includes('playlist/')) {
      const [, playlistId] = desiredCollection.split('/');

      this._collection = await fetchPlaylistItems(playlistId);
    }
  }

  disconnectedCallback() {
    this._io.disconnect();
  }

  set html(documentFragment) {
    this._sDOM.appendChild(documentFragment);
  }

  $(q) {
    return this._sDOM.querySelector(q);
  }

  async appendNextChunk() {
    const grid = this.$('#items');
    const mode = this.getAttribute('mode');
    const next = await this._collection.next();

    if (next.done) {
      this._io.disconnect();
      return;
    }

    const chunk = next.value;

    const frag = stringToElements(chunk);

    requestAnimationFrame(() => grid.appendChild(frag));
  }

  async connectedCallback() {
    this._sDOM = this.attachShadow({ mode: 'closed' });

    this.html = html`
      <style>
      #sentinel {
        display: block;
        width: 100%;
        height: 20px;
      }
      </style>
      <div id="items" class="media-table"></div>
      <griddy-grid id="items" class="grid"></griddy-grid>
      <div id="sentinel"></div>
    `;

    const path = this.getAttribute('path');
    const mode = this.getAttribute('mode');

    if (mode === 'grid') {
      this.$('.media-table').remove();
    } else {
      this.$('.grid').remove();
    }

    const sentinel = this.$('#sentinel');

    await this.fetchCollection();

    this._io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && this._collection) {
          this.appendNextChunk();
        }
      });
    }, {});

    this._io.observe(sentinel);
  }
}

customElements.define('paginator-loader', PaginatorLoader);
