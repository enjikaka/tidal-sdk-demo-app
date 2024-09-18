import { registerFunctionComponent } from 'webact';

async function AlbumLink() {
  const { html, css, postRender, $ } = this;

  css`
  :host {
    max-width: 100%;
    overflow: hidden;
    font-size: 10pt;
    cursor: pointer;
    content-visibility: auto;
    contain-intrinsic-size: 128px 166.66px;
  }

  :host(:hover) {
    font-variation-settings: "MONO" .2,"CASL" 0,"wght" 500,"slnt" 0.1,"CRSV" 0;
  }

  ::slotted(a:hover) {
    text-decoration: underline;
  }

  slot {
    display: block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  a:-webkit-any-link {
    all: unset;
  }

  ::slotted(img),
  ::slotted(tidal-image) {
    overflow: hidden;
    contain: strict;
    box-sizing: border-box;
    transition: transform 150ms ease;
  }

  ::slotted(a) {
    color: currentColor;
    white-space: nowrap;
    margin-right: 0.5em;
  }

  ::slotted(a::before) {
    content: ", ";
  }

  [slot name="artists"] ::slotted(*) {
    margin-right: 1rem;
  }

  .image-wrapper {
    height: 128px;
    margin-bottom: 0.5ch;
    border-radius: 6px;
    overflow: hidden;
  }
  `;

  html`
    <div class="image-wrapper">
      <slot name="image"></slot>
    </div>
    <slot name="album"></slot>
    <slot name="artists"></slot>
  `;

  postRender(() => {
    $().addEventListener('click', () => {
      const a = $('[name="album"]').assignedNodes().pop();

      a.click();
    })
  });
}

registerFunctionComponent(AlbumLink, {
  name: 'album-link'
});
