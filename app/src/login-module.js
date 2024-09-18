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
    const loginUrl = await Auth.initializeLogin({
      redirectUri: document.location.origin,
    });

    window.open(loginUrl, '_self');
  });
}

registerFunctionComponent(LoginModule, {
  name: 'login-module'
});
