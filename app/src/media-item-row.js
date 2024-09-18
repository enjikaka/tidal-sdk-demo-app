import { registerFunctionComponent } from 'webact';

async function MediaItemRow() {
  const { html, css, postRender, $ } = this;

  css`
  :host {
    display: flex;
    flex-flow: row nowrap;
    font-size: 10pt;
    transition: font-variation-settings 100ms ease-in;
    content-visibility: auto;
    contain-intrinsic-size: 100vw 64px;
    border-radius: 6px;
    overflow: hidden;
  }

  :host(:hover) {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .cell {
    display: flex;
    flex: 1;
    align-items: center;
    max-width: 100%;
    overflow: hidden;
  }

  .cell.duration {
    max-width: 50px;
    text-align: right;
  }

  .cell.title {
    flex: 2;
  }

  .cell.cover,
  .cell.album {
    display: none;
  }

  :host([album-cell]) .cell.album {
    display: flex;
  }

  :host([cover-cell]) .cell.cover {
    display: flex;
  }

  ::slotted(tidal-image) {
    overflow: hidden;
    contain: strict;
  }

  .cell.playback {
    width: 32px;
    max-width: 32px;
    height: 64px;
    max-height: 64px;
  }

  .cell.cover {
    width: 64px;
    max-width: 64px;
    height: 64px;
    max-height: 64px;
  }

  ::slotted(span),
  ::slotted(a) {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 100%;
    color: currentColor;
    margin-right: 1rem;
  }

  ::slotted([slot="duration"]) {
    font-variant-numeric: tabular-nums;
    flex: 0;
  }

  svg {
    width: 22px;
    aspect-ratio: 1 / 1;
    transform: translateY(1.5px)
  }
  `;

  html`
    <div class="cell cover">
      <slot name="image"></slot>
    </div>
    <div class="cell playback">
      <play-trigger item-type="track" item-id="-1">
        <svg><use href="icons.svg#play"></use></svg>
      </play-trigger>
    </div>
    <div class="cell title">
      <slot name="title"></slot>
    </div>
    <div class="cell artist">
      <slot name="artist"></slot>
    </div>
    <div class="cell album">
      <slot name="album"></slot>
    </div>
    <div class="cell duration">
      <slot name="duration"></slot>
    </div>
  `;

  postRender(() => {
    const itemId = $().getAttribute('item-id');
    const itemType = $().getAttribute('item-type');

    $('play-trigger').setAttribute('item-id', itemId);
    $('play-trigger').setAttribute('item-type', itemType);
    $('play-trigger').setAttribute('item-title', $('slot[name="title"]').assignedElements()[0].textContent);
    $('play-trigger').setAttribute('item-artist', $('slot[name="artist"]').assignedElements()[0].textContent);
  });
}

registerFunctionComponent(MediaItemRow, {
  name: 'media-item-row'
});
