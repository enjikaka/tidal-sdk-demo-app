import { registerFunctionComponent } from 'webact';

function HorizontalGrid() {
  const { html, css } = this;

  css`
    :host {
      height: 100%;
      width: 100%;
      overflow-y: auto;
      overflow-x: auto;
      display: flex;
      flow-flow: row nowrap;
      scroll-snap-type: mandatory;
      scroll-snap-points-y: repeat(128px);
      scroll-snap-type: x mandatory;
      align-items: center;
      will-change: scroll-position;
      content-visibility: auto;
      scrollbar-color: rgb(228 110 12) rgb(237 224 208);
      scrollbar-width: thin;
    }

    ::slotted(*) {
      scroll-snap-align: start;
      flex-shrink: 0;
    }
  `;

  html`
    <slot></slot>
  `;
}

registerFunctionComponent(HorizontalGrid, {
  name: 'horizontal-grid'
});
