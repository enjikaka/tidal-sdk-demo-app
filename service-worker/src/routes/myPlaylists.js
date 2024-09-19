import { cacheAndReturn, fetchMyPlaylists, validCacheResponse } from "../helpers.js";

/**
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function myPlaylistsRouteHandler (request) {
  const cachedResponse = await validCacheResponse(request);

  if (cachedResponse) {
    console.debug('Returning cached response for', request.url);
    return cachedResponse;
  }

  const authorization = request.headers.get('authorization');

  const myMixes = await fetchMyPlaylists(authorization, 'vertical');

  return cacheAndReturn(request, new Response(
    myMixes,
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