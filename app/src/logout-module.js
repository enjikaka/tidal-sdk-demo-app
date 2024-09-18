import { registerFunctionComponent } from 'webact';

import * as Auth from '@tidal-music/auth';

async function LogoutModule() {
  const { postRender } = this;

  postRender(async () => {
    Auth.logout();
    localStorage.clear();

    window.location.replace('/');
  });
}

registerFunctionComponent(LogoutModule, {
  name: 'logout-module'
});
