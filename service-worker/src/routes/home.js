import { fetchMyMixes, fetchMyPlaylists } from "../helpers.js";

/**
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function homeRouteHandler (request) {
  const authorization = request.headers.get('authorization');

  const [myMixes, myPlaylists] = await Promise.all([
    fetchMyMixes(authorization, 'horizontal'),
    fetchMyPlaylists(authorization, 'horizontal'),
  ]);

  return new Response(
    myMixes + myPlaylists,
    {
      status: 200,
      headers: new Headers({
        'content-type': 'text/html'
      })
    }
  );
}
