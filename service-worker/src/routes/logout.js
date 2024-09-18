/**
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function logoutRouteHandler (request) {
  return new Response(
    '<logout-module></logout-module>',
    {
      status: 200,
      headers: new Headers({
        'content-type': 'text/html'
      })
    }
  );
}

