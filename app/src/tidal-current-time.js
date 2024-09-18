import * as Player from '@tidal-music/player';
import { asTime, timeDateTime } from './helpers.js';

const customElementName = 'tidal-current-time';

export class TidalCurrentTime extends HTMLElement {
  /** @type {HTMLTimeElement | undefined} */
  #$time;

  #connectedMediaElements = new Set();

  /** @type {EventListener} */
  #handleMediaProductTransition;

  /** @type {EventListener} */
  #resetTime;

  /** @type {EventListener} */
  #timeUpdateHandler;

  constructor() {
    super();

    this.#timeUpdateHandler = event => {
      if (event.target instanceof HTMLMediaElement) {
        this.renderTime(event.target.currentTime);
      }
    };
    this.#resetTime = () => this.renderTime(0);
    this.#handleMediaProductTransition =
      this.#registerTimeUpdateListener.bind(this);
  }

  #registerTimeUpdateListener() {
    const $media = Player.getMediaElement();

    if ($media && this.#$time && !this.#connectedMediaElements.has($media)) {
      $media.addEventListener('timeupdate', this.#timeUpdateHandler, false);
      this.#connectedMediaElements.add($media);
    }
  }

  connectedCallback() {
    const sDOM = this.attachShadow({ mode: 'open' });

    sDOM.innerHTML = '<time></time>';

    const timeElement = sDOM.querySelector('time');

    if (this.#$time === undefined && timeElement !== null) {
      this.#$time = timeElement;
    }

    this.renderTime(Player.getAssetPosition());

    Player.events.addEventListener(
      'media-product-transition',
      this.#handleMediaProductTransition,
      false,
    );
    Player.events.addEventListener('ended', this.#resetTime, false);
  }

  disconnectedCallback() {
    for (let connectedMediaElement of this.#connectedMediaElements) {
      connectedMediaElement.removeEventListener(
        'timeupdate',
        this.#timeUpdateHandler,
        false,
      );
    }

    Player.events.removeEventListener(
      'media-product-transition',
      this.#handleMediaProductTransition,
      false,
    );
    Player.events.removeEventListener('ended', this.#resetTime, false);
  }

  /**
   *
   * @param {number} seconds
   */
  renderTime(seconds) {
    const roundedSeconds = Math.floor(seconds);

    if (this.#$time) {
      this.#$time.textContent = asTime(roundedSeconds);
      this.#$time.setAttribute('datetime', timeDateTime(roundedSeconds));
    }
  }
}

customElements.define(customElementName, TidalCurrentTime);

// Exporting the component name as string allows virtual DOM interop.
// eslint-disable-next-line import/no-default-export
export default customElementName;