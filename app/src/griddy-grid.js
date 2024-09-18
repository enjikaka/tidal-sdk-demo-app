import { registerFunctionComponent } from 'webact';

function GriddyGrid() {
  const { html, css } = this;

  css`
    :host {
      height: 100%;
      width: 100%;
      display: grid;
      grid-template-columns: repeat(4, 128px);
      grid-gap: 1.61rem;
      justify-content: center;
      content-visibility: auto;
    }

    /* https://stackoverflow.com/questions/52785750/prevent-grid-area-from-expanding-causing-whole-page-to-scroll */
    ::slotted(*) {
      min-width: 0;
      min-height: 0;
      overflow: hidden;
    }
  `;

  html`
    <slot></slot>
  `;
}

registerFunctionComponent(GriddyGrid, {
  name: 'griddy-grid'
});
