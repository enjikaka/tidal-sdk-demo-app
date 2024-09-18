export const css = String.raw;

export function stringToElements(string) {
  return document.createRange().createContextualFragment(string);
}

export function html(strings, ...rest) {
  const text = Array.isArray(strings) ? strings.reduce((acc, curr, i) => {
    return acc + (rest[i] ? curr + rest[i] : curr);
  }, '') : strings;
  return stringToElements(text);
}

export function artistLinks(artists) {
  return artists.map(artist => `
    <a href="#!/artist/${artist.id}" slot="artists">${artist.name}</a>
  `.trim()).join(', ')
}

export function itemToMediaItemRow(item, { albumColumn, coverColumn } = { albumColumn: true, coverColumn: true }) {
  let resourceId = null;

  if ('imageId' in item && item.imageId !== null) {
    resourceId = item.imageId;
  }

  if ('album' in item && item.album !== null) {
    resourceId = item.album.cover;
  }

  return html`
    <media-item-row item-id="${item.id}" ${albumColumn ? 'album-cell' : '' } ${coverColumn ? 'cover-cell' : '' }>
      <span slot="title">${item.title}${item.audioQuality === 'HI_RES' ? ' (MASTER)' : null}</span>
      <span slot="artist">${artistLinks(item.artists || [item.artist || { id: 0, name: "Unknown" }])}</span>
      ${item.album ? `<a slot="album" href="#!/album/${item.album.id}">${item.album.title}</a>` : ''}
      <tidal-image sizes="48px" resource-id="${resourceId}" slot="image"></tidal-image>
    </media-item-row>
  `;
}

export function itemToAlbumLink(item) {
  let image;

  if (!('images' in item)) {
    const resourceId = item.cover || item.squareImage || item.image;
    let imageType;

    if ('cover' in item) {
      imageType = 'album';
    }

    if ('uuid' in item && 'squareImage' in item) {
      imageType = 'playlist';
    }

    if ('uuid' in item && resourceId !== item.squareImage) {
      imageType = 'old-playlist';
    }

    image = `<tidal-image sizes="128px" resource-id="${resourceId}" image-type="${imageType}" slot="image"></tidal-image>`;
  } else {
    const src = item.images.SMALL.url;
    const srcset = Object.values(item.images).map(v => `${v.url} ${v.width}w`).join(', ');

    image = `<img slot="image" loading="lazy" decoding="async" src="${src}" srcset="${srcset}" width="128px" height="128px" crossorigin="anonymous">`;
  }

  const link = 'url' in item ? `!/${item.url.split('/')[3]}/${item.id || item.uuid}` : '';

  return html`
    <album-link>
      <a slot="album" href="#/${link}">${item.title}</a>
      ${item.artists ? artistLinks(item.artists) : ''}
      ${image}
    </album-link>
  `;
}

/**
 * Takes 't' seconds and formats them as '(hh:)mm:ss'.
 * Only 0-pad minutes if needed (hours present).
 *
 * @param {number | string} [t] - Seconds
 */
export function asTime(t) {
  if (t === undefined) {
    return '0:00';
  }

  const numSecs = parseInt(String(t), 10);
  const hours = Math.floor(numSecs / 3600);
  const minutes = Math.floor((numSecs - hours * 3600) / 60);
  const seconds = numSecs - hours * 3600 - minutes * 60;

  let time = '';

  if (hours !== 0) {
    const mins = minutes < 10 ? `0${minutes}` : String(minutes);
    time = `${hours}:${mins}:`;
  } else {
    time = `${minutes}:`;
  }

  time += seconds < 10 ? `0${seconds}` : String(seconds);

  return time;
}

/**
 * Formats seconds to datetime durations for the <time> element.
 *
 * @see https://www.w3.org/TR/html5/infrastructure.html#duration-time-component
 * @param {number | string} t - Seconds
 */
export function timeDateTime(t = 0) {
  const sec = typeof t === 'number' ? t : parseInt(t, 10);
  const h = Math.floor(sec / 3600) % 24;
  const m = Math.floor(sec / 60) % 60;
  const s = sec % 60;

  const partNumberstring = (value, index) => {
    // Do nothing if hour or seconds is 0. (Minute must always be present)
    if (value === 0 && index !== 1) {
      return '';
    }

    let partType;

    switch (index) {
      case 0:
        partType = 'H';
        break;
      case 1:
        partType = 'M';
        break;
      default:
        partType = 'S';
        break;
    }

    return `${partType}${value}`;
  };

  const time = [h, m, s].map(partNumberstring).join('');

  return `P${time}`;
}
