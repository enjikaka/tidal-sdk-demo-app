import { registerFunctionComponent } from 'webact';

const albumSizes = [80, 160, 320, 640, 1280];
const playlistSizes = [160, 320, 480, 640, 750, 1080];
const playlistOldSizes = [
  '160x107',
  '320x214',
  '480x320',
  '640x428',
  '750x500',
  '1080x720',
];

/**
 * Get image source to an album cover from a resourceId.
 *
 * @param {{ resourceId: string, size: number|string, imageType: 'album' | 'playlist' | 'old-playlist' }} options - ID of the image
 * @return {string} - Image URL
 */
function getImageSource(options) {
  const { resourceId, size = 640, imageType = 'album' } = options;
  const path = resourceId.replace(/-/g, '/');
  let width;
  let height;

  switch (imageType) {
    case 'playlist':
      [width, height] = playlistSizes.includes(size) ? [size, size] : [playlistSizes[0], playlistSizes[0]];
      break;
    case 'old-playlist':
      [width, height] = playlistOldSizes.filter(x => x.includes(size))[0].split('x');
      break;
    case 'album':
    default:
      [width, height] = albumSizes.includes(size) ? [size, size] : [albumSizes[0], albumSizes[0]];
      break;
  }

  const imageSource = `https://resources.tidal.com/images/${path}/${width}x${height}.jpg`;

  return imageSource;
}

function getImageSourceSet(options) {
  const { resourceId, imageType = 'album' } = options;
  const path = resourceId.replace(/-/g, '/');

  let sourceSet;

  switch (imageType) {
    case 'playlist':
      sourceSet = playlistSizes
        .map(size => `https://resources.tidal.com/images/${path}/${size}x${size}.jpg ${size}w`)
        .join(', ');
      break;
    case 'old-playlist':
      sourceSet = playlistOldSizes.map(x => x.split('x')).map(([width, height]) => `https://resources.tidal.com/images/${path}/${width}x${height}.jpg ${width}w`).join(', ');
      break;
    case 'album':
    default:
      sourceSet = albumSizes
        .map(size => `https://resources.tidal.com/images/${path}/${size}x${size}.jpg ${size}w`)
        .join(', ');
      break;
  }

  return sourceSet;
}

function TidalImage(props) {
  const { html, css, postRender, $, propsChanged } = this;

  html`
    <img loading="lazy" decoding="async" crossorigin="anonymous">
  `;

  css`
  :host {
    background-color: #151517;
    background-image: url(fallback.svg);
    background-size: cover;
    overflow: hidden;
    display: block;
  }

  img {
    object-fit: cover;
    object-position: 0 0;
    width: 100%;
    height: 100%;
  }
  `;

  function renderFromProps({ resourceId, sizes, imageType }) {
    const host = $(':host');
    const img = $('img');

    if (resourceId) {
      img.src = getImageSource({ resourceId, size: 80, imageType });
      img.srcset = getImageSourceSet({ resourceId, imageType });
    }

    if (sizes) {
      host.style.width = sizes;
      host.style.height = sizes;
      img.sizes = sizes;
    }

    img.onerror = () => img.remove();
  }

  postRender(() => renderFromProps(props));
  propsChanged(newProps => renderFromProps(newProps));
}

export default registerFunctionComponent(TidalImage, {
  observedAttributes: ['sizes'],
  name: 'tidal-image'
});
