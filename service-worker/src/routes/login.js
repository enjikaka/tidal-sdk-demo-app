/**
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function loginRouteHandler (request) {
  const body = '<login-module></login-module>';
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

