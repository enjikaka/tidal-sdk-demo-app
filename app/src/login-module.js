import { registerFunctionComponent } from 'webact';

import * as Auth from '@tidal-music/auth';

async function LoginModule() {
  const { html, css, postRender, $ } = this;

  css`
    div {
      border: 1px dashed black;
      padding: 1rem;
      margin: 0 1rem;
      margin-top: 0.5rem;
    }
  `;

  postRender(async () => {
    // @ts-expect-error - Injected by esbuild
    const clientId = process.env.API_CLIENT_ID;
    const redirectUri = document.location.origin;

    // store these values, since we need them after the redirect
    localStorage.setItem('clientId', clientId);
    localStorage.setItem('redirectUri', redirectUri);

    await Auth.init({
      clientId: `${clientId}`,
      credentialsStorageKey: 'authorizationCode',
      // @ts-expect-error - Injected by esbuild
      clientSecret: process.env.API_CLIENT_SECRET,
      clientUniqueKey: 'tidal-demo-example',
      scopes: [
        'playlists.read',
        'user.read',
        'recommendations.read',
        'playback',
      ]
    });

    const loginUrl = await Auth.initializeLogin({
      redirectUri: `${redirectUri}`,
    });

    window.open(loginUrl, '_self');
  });
}

registerFunctionComponent(LoginModule, {
  name: 'login-module'
});
