export const html = String.raw;

export async function cacheAndReturn (request, response) {
  const cache = await caches.open("pages");

  cache.put(request, response.clone());

  return response;
}

export async function validCacheResponse (request) {
  const cache = await caches.open("pages");
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    const cacheControl = cachedResponse.headers.get('cache-control');

    if (cacheControl && cacheControl.includes('max-age')) {
      const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);

      if (maxAgeMatch) {
        const maxAge = parseInt(maxAgeMatch[1], 10);
        const dateHeader = cachedResponse.headers.get('date');

        if (dateHeader) {
          const fetchedTime = new Date(dateHeader).getTime();
          const currentTime = Date.now();
          const age = (currentTime - fetchedTime) / 1000; // age in seconds

          if (age < maxAge) {
            // Cache is still valid
            return cachedResponse;
          }
        }
      }
    }
  }
}

function parseISODurationToTime(duration) {
  const regex = /P(?:T)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = duration.match(regex);
  const minutes = parseInt(matches[1] || 0, 10);
  const seconds = parseInt(matches[2] || 0, 10);

  // Calculate total seconds
  const totalSeconds = (minutes * 60) + seconds;

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;

  // Format as hh:mm:ss or mm:ss if hours are 0
  const formattedTime =
    (hours > 0 ? String(hours).padStart(2, '0') + ':' : '') +
    String(mins).padStart(2, '0') + ':' +
    String(secs).padStart(2, '0');

  return formattedTime;
}

export function sortIncludedByRelationships(json) {
  const relationshipData = [];

  // Collect all relationship data into a flat array
  Object.keys(json.data.relationships).forEach(relationshipKey => {
    const relationship = json.data.relationships[relationshipKey].data;

    // Handle single or multiple relationships
    if (Array.isArray(relationship)) {
      relationshipData.push(...relationship);
    } else {
      relationshipData.push(relationship);
    }
  });

  // Sort the included array based on relationship order
  json.included.sort((a, b) => {
    const aIndex = relationshipData.findIndex(rel => rel.id === a.id && rel.type === a.type);
    const bIndex = relationshipData.findIndex(rel => rel.id === b.id && rel.type === b.type);
    return aIndex - bIndex;
  });

  return json.included; // Now sorted according to relationships order
}

export function artistLinks(artists) {
  return artists.map(artist => `
    <a href="#!/artist/${artist.id}" slot="artists">${artist.name}</a>
  `.trim()).join(', ')
}

export function itemToArtistLink(artist) {
  const image = `
    <tidal-image sizes="128px" resource-id="${artist.picture}" image-type="artist" slot="image"></tidal-image>
  `;

  return `
    <album-link>
      <a slot="album" href="#!/artist/${artist.id}">${artist.name}</a>
      ${image}
    </album-link>
  `;
}

/**
* @param {{ mediaProduct: MediaProduct, album: Album, artist: Artist }} item
* @param {{ albumColumn: boolean, coverColumn: boolean, authorization: string }} param1
* @returns
*/
export async function itemToMediaItemRow(item, { albumColumn, coverColumn, authorization }) {
 const { mediaProduct, album, artist } = item;

 return `
   <media-item-row item-type="${mediaProduct.type === 'videos' ? 'video' : 'track'}" item-id="${mediaProduct.id}" ${albumColumn ? 'album-cell' : ''} ${coverColumn ? 'cover-cell' : ''}>
     <span slot="title">${mediaProduct.attributes.title}${mediaProduct.attributes.mediaTags.includes('HI_RES') ? ' (MAX)' : ''}</span>
     <span slot="artist">${artist.attributes.name}</span>
     <span slot="album">${album.attributes.title}</span>
     <span slot="duration">${parseISODurationToTime(mediaProduct.attributes.duration)}</span>
   </media-item-row>
 `;
}

export function imageForPlaylist(playlist) {
  const src = playlist.imageLinks[0]?.href ?? 'fallback.svg';
  const srcset = Object.values(playlist.imageLinks).map(v => `${v.href} ${v.meta.width}w`).join(', ');

  return `<img slot="image" loading="lazy" decoding="async" src="${src}" srcset="${srcset}" sizes="128px" width="128px" height="128px" crossorigin="anonymous">`;
}

/**
 * Build My Mixes module.
 *
 * @param {string} authorization
 * @param {'vertical' | 'horizontal'} position
 * @returns
 */
export const fetchMyMixes = async (authorization, position) => {
  const items = await myMixesAsAlbumLinks(authorization);
  const elementName = position === 'vertical' ? 'griddy-grid' : 'horizontal-grid';

  return `
    <h2>My Mixes</h2>
    <${elementName}>${items.length === 0 ? 'No mixes found' : items}</${elementName}>
  `;
};

/**
 * Build My Playlists module.
 *
 * @param {string} authorization
 * @param {'vertical' | 'horizontal'} position
 * @returns
 */
export const fetchMyPlaylists = async (authorization, position) => {
  const items = await myPlaylistsAsAlbumLinks(authorization);
  const elementName = position === 'vertical' ? 'griddy-grid' : 'horizontal-grid';

  return `
    <h2>My Playlists</h2>
    <${elementName}>${items.length === 0 ? 'No playlists found' : items}</${elementName}>
  `;
};

/**
 *
 * @param {string} authorization
 * @returns
 */
async function myPlaylistsAsAlbumLinks (authorization) {
  const response = await fetch('https://openapi.tidal.com/v2/playlists/me', {
    headers: new Headers({
      'authorization': authorization
    })
  });
  const json = await response.json();

  return json.data.map(playlistDataToAlbumLink).join('');
}

const playlistDataToAlbumLink = ({ attributes: playlist, id }) => {
  const link = `playlists/${id}`;
  const image = imageForPlaylist(playlist);

  return `
    <album-link>
      <a slot="album" href="#!/${link}">${playlist.name}</a>
      ${playlist.description}
      ${image}
    </album-link>
  `;
};

/**
 *
 * @param {string} authorization
 * @returns
 */
async function myMixesAsAlbumLinks (authorization) {
  const userRecommendationsRespone = await fetch('https://openapi.tidal.com/v2/userRecommendations/me?include=myMixes,discoveryMixes,newArrivalMixes', {
    headers: new Headers({
      'authorization': authorization
    })
  });
  const userRecommendationsJson = await userRecommendationsRespone.json();

  return userRecommendationsJson.included
    .sort(myMixesNameSorter)
    .map(playlistDataToAlbumLink).join('');
}

const myMixesNameSorter = (a, b) => {
  const specialItems = ["My Daily Discovery", "My New Arrivals"];

  if (specialItems.includes(a.attributes.name) && !specialItems.includes(b.attributes.name)) {
    return -1;
  }
  if (!specialItems.includes(a.attributes.name) && specialItems.includes(b.attributes.name)) {
    return 1;
  }

  // Handle the "My Mix X" sorting by extracting the number X
  const myMixRegex = /My Mix (\d+)/;
  const aMatch = a.attributes.name.match(myMixRegex);
  const bMatch = b.attributes.name.match(myMixRegex);

  if (aMatch && bMatch) {
    return parseInt(aMatch[1]) - parseInt(bMatch[1]);
  }

  return 0; // Default, in case items don't match "My Mix X"
};
