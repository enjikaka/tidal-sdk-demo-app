import { cacheAndReturn, fetchMyMixes, fetchMyPlaylists, validCacheResponse } from "../helpers.js";

/**
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function homeRouteHandler (request) {
  const cachedResponse = await validCacheResponse(request);

  if (cachedResponse) {
    console.debug('Returning cached response for', request.url);
    return cachedResponse;
  }

  const authorization = request.headers.get('authorization');

  const [myMixes, myPlaylists] = await Promise.all([
    fetchMyMixes(authorization, 'horizontal'),
    fetchMyPlaylists(authorization, 'horizontal'),
  ]);

  const body = myMixes + myPlaylists;
  const contentLength = new TextEncoder().encode(body).length;

  return cacheAndReturn(request, new Response(
    body,
    {
      status: 200,
      headers: new Headers({
        'content-type': 'text/html',
        'content-length': String(contentLength),
        'cache-control': 'public, max-age=3600',
        'date': new Date().toUTCString(),
        'vary': authorization.split(' ')[1],
      })
    }
  ));
}
