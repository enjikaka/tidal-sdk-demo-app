/**
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function searchRouteHandler (request) {
  const body = '<p>You will soon be able to search here...</p>';
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

