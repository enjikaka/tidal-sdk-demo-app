/**
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function loginRouteHandler (request) {
  return new Response(
    '<login-module></login-module>',
    {
      status: 200,
      headers: new Headers({
        'content-type': 'text/html'
      })
    }
  );
}

