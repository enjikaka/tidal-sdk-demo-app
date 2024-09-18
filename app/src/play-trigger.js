import { registerFunctionComponent } from 'webact';

async function PlayTrigger() {
  const { html, css, postRender, $ } = this;

  html`
    <button>
      <slot></slot>
    </button>
  `;

  css`
    :host {
      cursor: pointer;
    }

    button {
      all: unset;
    }
  `;

  postRender(() => {
    const host = $();

    host.addEventListener('click', () => {
      performance.mark('play-trigger');
      const itemType = host.getAttribute('item-type');
      const itemId = host.getAttribute('item-id');

      document.dispatchEvent(
        new CustomEvent('play-queue:add', {
          detail: {
            play: true,
            items: [
              {
                type: itemType,
                id: itemId
              }
            ]
          }
        })
      );
    });
  });
}

registerFunctionComponent(PlayTrigger, {
  name: 'play-trigger'
});
