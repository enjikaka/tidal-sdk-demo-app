import { registerFunctionComponent } from 'webact';

async function LoadingIndicator() {
  const { html, css, postRender, $ } = this;

  css`
  :host {
    display: block;
    height: 3px;
    width: 100%;
    overflow: hidden;
    position: relative;
  }

  span::after {
    content: '';
    width: 96px;
    height: 100%;
    background: rgb(228 110 12);
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    animation: hitZak 0.6s ease-in-out infinite alternate;
  }

  @keyframes hitZak {
    0% {
      left: 0;
      transform: translateX(-1%);
    }
    100% {
      left: 100%;
      transform: translateX(-99%);
    }
  }
  `;

  html`
    <span></span>
  `;
}

registerFunctionComponent(LoadingIndicator, {
  name: 'loading-indicator'
});
