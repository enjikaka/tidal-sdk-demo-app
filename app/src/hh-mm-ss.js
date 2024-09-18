/**
 * Takes 't' seconds and formats them as '(hh:)mm:ss'.
 * Only 0-pad minutes if needed (hours present).
 *
 * @param {string} t - Seconds
 * @returns {string} - (hh:)mm:ss
 */
function asTime (t) {
  if (t === undefined) {
    return '0:00';
  }

  const numSecs = parseInt(t, 10);
  const hours = Math.floor(numSecs / 3600);

  /** @type {number|string} */
  let minutes = Math.floor((numSecs - hours * 3600) / 60);
  const seconds = numSecs - hours * 3600 - minutes * 60;

  let time = '';

  if (hours !== 0) {
    time = hours + ':';
    minutes = minutes < 10 && time !== '' ? '0' + minutes : String(minutes);
  }

  time += minutes + ':';
  time += seconds < 10 ? '0' + seconds : String(seconds);

  return time;
}

class HhMmSs extends HTMLElement {
  connectedCallback () {
    if (this.textContent === 'null') {
      this.remove();

      return;
    }

    this.textContent = asTime(this.textContent);
  }
}

window.customElements.define('hh-mm-ss', HhMmSs);
