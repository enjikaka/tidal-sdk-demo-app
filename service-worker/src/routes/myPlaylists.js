import { fetchMyPlaylists } from "../helpers.js";

/**
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function myPlaylistsRouteHandler (request) {
  const authorization = request.headers.get('authorization');

  const myMixes = await fetchMyPlaylists(authorization, 'vertical')

  return new Response(
    myMixes,
    {
      status: 200,
      headers: new Headers({
        'content-type': 'text/html'
      })
    }
  );
}