import { itemToMediaItemRow, sortIncludedByRelationships, html, imageForPlaylist, validCacheResponse, cacheAndReturn } from "../helpers.js";

/**
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function playlistRouteHandler (request) {
  const cachedResponse = await validCacheResponse(request);

  if (cachedResponse) {
    console.debug('Returning cached response for', request.url);
    return cachedResponse;
  }

  const authorization = request.headers.get('authorization');
  const url = new URL(request.url);
  const [,,, playlistId] = url.pathname.split('/');

  const response = await fetch(`https://openapi.tidal.com/v2/playlists/${playlistId}?countryCode=SE&include=items`, {
    headers: new Headers({
      'authorization': authorization
    })
  });

  /** @type {Playlist} */
  const json = await response.json();

  /** @type {Array<MediaProduct>} */
  const included = sortIncludedByRelationships(json);
  const itemsIds = included.map(item => item.id);

  const _url = new URL(`https://openapi.tidal.com/v2/tracks?countryCode=SE&include=albums,artists`);

  _url.searchParams.set('filter[id]', itemsIds.join(','));

  const itemMetaDataResponse =  await fetch(_url.toString(), {
    headers: new Headers({
      'authorization': authorization
    })
  });
  const itemMetadataJson = await itemMetaDataResponse.json();

  const playlistItems = itemMetadataJson.data.map(item => {
    const mediaProduct = item;
    const albumId = item.relationships.albums.data[0].id;
    const album = itemMetadataJson.included.find(i => i.id === albumId);
    const artistId = item.relationships.artists.data[0].id;
    const artist = itemMetadataJson.included.find(i => i.id === artistId);

    return {
      mediaProduct,
      album,
      artist
    }
  });

  const items = await Promise.all(playlistItems.map(item => itemToMediaItemRow(item, { authorization, albumColumn: false, coverColumn: false })));

  return cacheAndReturn(request, new Response(
    html`
      <album-header>
        ${imageForPlaylist(json.data.attributes)}
        <h1 slot="title">${json.data.attributes.name}</h1>
        <p slot="artists">${json.data.attributes.description}</p>
      </album-header>
      ${items.join('')}
    `,
    {
      status: 200,
      headers: new Headers({
        'content-type': 'text/html',
        'cache-control': 'public, max-age=3600',
        'date': new Date().toUTCString()
      })
    }
  ));
}