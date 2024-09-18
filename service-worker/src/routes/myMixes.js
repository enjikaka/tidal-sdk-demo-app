import { fetchMyMixes } from "../helpers.js";

/**
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function myMixesRouteHandler (request) {
  const authorization = request.headers.get('authorization');

  const myMixes = await fetchMyMixes(authorization, 'vertical')

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