/**
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function logoutRouteHandler (request) {
  const body = '<logout-module></logout-module>';
  const contentLength = new TextEncoder().encode(body).length;

  return new Response(
    body,
    {
      status: 200,
      headers: new Headers({
        'content-type': 'text/html',
        'content-length': String(contentLength),
      })
    }
  );
}

