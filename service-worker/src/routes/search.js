/**
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function searchRouteHandler (request) {
  return new Response(
    '<p>You will soon be able to search here...</p>',
    {
      status: 200,
      headers: new Headers({
        'content-type': 'text/html'
      })
    }
  );
}

