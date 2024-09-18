# tidal-sdk-demo-app

A small demo application for using the TIDAL Open API.

## Implementation notes

### Service-Worker Side Rendering (SWSR)

To build views, this demo project calls the JSON API inside the service worker and builds the HTML there before sending it back to the client. This way, a hosted glue layer for transforming API responses into markup is not needed - it can be done on the client!
