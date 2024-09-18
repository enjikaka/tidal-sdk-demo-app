import * as Boombox from '@tidal-music/player';

import { registerFunctionComponent } from 'webact';
import { itemToMediaItemRow } from './helpers.js'

const queue = [];
let currentQueuePosition = 0;

function PlayQueue() {
  const { html, css, postRender, $ } = this;

  css`
    :host {
      height: calc(100vh - 50px - 84px); /* 84px footer height, 51px header  */
      width: 50vw;
      overflow-y: auto;
      display: flex;
      will-change: transform scroll-position;
      content-visibility: auto;
      position: fixed;
      top: 50px;
      right: 0;
      bottom: 84px;
      transform: translateX(100%);
      transition: transform 500ms ease;
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(5px);
      padding: 1rem;
      color: white;
      display: flex;
      flex-flow: column nowrap;
      box-sizing: border-box;
    }

    :host(.open) {
      transform: none;
    }

    ol {
      all: unset;
      padding: 1rem 0;
    }

    ::slotted(media-item-row) {
      border-left: 5px solid transparent;
      padding-left: 1rem;
    }

    ::slotted(.current) {
      color: cyan;
      border-left: 5px solid cyan;
    }
  `;

  html`
    <strong>Play Queue</strong>
    <ol>
      <slot></slot>
    </ol>
  `;

  const renderQueue = () => {
    const pq = $(':root');

    pq.innerHTML = null;

    for (const frag of queue.map(item => itemToMediaItemRow(item, { albumColumn: false, coverColumn: true }))) {
      requestAnimationFrame(() => pq.appendChild(frag));
    }

    const pos = pq.children[currentQueuePosition];

    if (pos) {
      pos.classList.add('current');
    }
  }

  const updateQueuePosition = () => {
    const pq = $(':root');

    $('.current')?.classList.remove('current');
    console.log(`media-item-row:nth-child(${currentQueuePosition + 1})`);
    pq.querySelector(`media-item-row:nth-child(${currentQueuePosition + 1})`)?.classList.add('current');
  }

  postRender(() => {
    const self = $(':host');

    document.addEventListener('play-queue:skip-next', async () => {
      const nextItem = queue[currentQueuePosition + 1];

      if (nextItem) {
        await Boombox.load({
          productId: nextItem.id,
          productType: nextItem.type,
          sourceId: 'tidal-boombox-example',
          sourceType: 'tidal-boombox-example'
        }, 0);

        await Boombox.play();
      }
    });

    document.addEventListener('play-queue:toggle', () => {
      self.classList.toggle('open');
      const currentItem = $('.current');

      if (self.classList.contains('open') && currentItem) {
        currentItem.scrollIntoView();
      }
    });

    Boombox.events.addEventListener('media-product-transition', e => {
      const { mediaProduct } = e.detail;

      let newPos = 0;

      queue.filter((item, index) => {
        if (String(item.id) === String(mediaProduct.productId)) {
          newPos = index;
        }
      });

      currentQueuePosition = newPos;
      updateQueuePosition();

      const nextItem = queue[currentQueuePosition + 1];

      if (nextItem) {
        Boombox.setNext({
          productId: nextItem.id,
          productType: nextItem.type,
          sourceId: 'tidal-boombox-example',
          sourceType: 'tidal-boombox-example'
        });
      }
    }, false);

    document.addEventListener('play-queue:add', async e => {
      if (e instanceof CustomEvent) {
        let { items, play } = e.detail;

        const itemIdsInQueue = queue.map(item => item.id).map(String);
        const itemsNotInQueue = items.filter(item => !itemIdsInQueue.includes(item.id));

        if (itemsNotInQueue.length > 0) {
          const queueItems = await Promise.all(
            itemsNotInQueue
              .map(async item => {
                /*
                if (Object.keys(item).length === 2) {
                  const response = await tidalFetch(`/${item.type}s/${item.id}`);
                  const meta = await response.json();

                  return meta;
                }
                */

                return item;
              })
          );

          queue.push(...queueItems);
          renderQueue();
        }

        if (play) {
          const mediaProduct = {
            productType: items[0].type,
            productId: items[0].id,
            sourceType: 'tidal-boombox-example',
            sourceId: 'tidal-boombox-example'
          };

          await Boombox.load(mediaProduct, 0);
          await Boombox.play();
        }
      }
    });
  });
}

registerFunctionComponent(PlayQueue, {
  name: 'play-queue'
});
