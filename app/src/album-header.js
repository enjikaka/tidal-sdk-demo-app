import { registerFunctionComponent } from 'webact';

async function AlbumHeader() {
  const { html, css } = this;

  css`
  @view-transition {
    navigation: auto;
  }

  :host {
    content-visibility: auto;
    display: flex;
    flex-flow: row nowrap;
    gap: 1.61rem;
  }

  figure {
    all: unset;
    display: contents;
  }

  .meta {
    flex: 1;
    align-content: center;
  }

  ::slotted([slot="title"]) {
    font-size: 1.2em;
    margin: 0;
  }

  ::slotted([slot="artists"]) {
    font-size: 1em;
    margin: 0;
  }

  ::slotted([slot="image"]) {
    overflow: hidden;
    border-radius: 6px;
    contain: layout;
  }

  button {
    border: 1px solid black;
    padding: 0.6em 1.2em;
    background: none;
    cursor: pointer;
    border-radius: 6px;
    display: inline-block;
    max-width: 20vw;
    margin-top: 0.5rem;
    outline: none;
  }
  `;

  html`
    <figure>
      <slot name="image" part="image"></slot>
    </figure>
    <div class="meta">
      <slot name="title"></slot>
      <slot name="artists"></slot>
      <!--<button id="play">Play</button>-->
    </div>
  `;

  /*
  postRender(() => {
    const playButton = $('#play')

    playButton.addEventListener('click', async () => {
      let items;

      if (collectionType === 'album') {
        const { textContent } = document.querySelector(`#${collectionType}-items-${collectionId}`);
        items = JSON.parse(textContent);
      }

      document.dispatchEvent(new CustomEvent('play-queue:add', {
        detail: {
          items,
          play: true
        }
      }))
    });
  });
  */
}

registerFunctionComponent(AlbumHeader, {
  name: 'album-header'
});
