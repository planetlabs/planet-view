import * as d3 from 'd3';
import Globe from './Globe.js';
import Player from './Player.js';
import Scene from './Scene.js';
import world from './assets/data/world-110m.json';

const internalURL =
  /gallery\.prod\.planet-labs\.com\/gallery\/v1\/posts\/(.*)$/;
const externalURL = 'https://www.planet.com/gallery/#!/post';
const postsURL = 'https://api.planet.com/gallery/v1/posts';

// trigger data loading
fetch(postsURL)
  .then(response => response.json())
  .then(ready)
  .catch(err => console.error(err)); // eslint-disable-line

/**
 * Handle loaded data.
 * @param {Object} world Land and country data.
 * @param {Document} gallery Gallery feed.
 */
function ready(gallery) {
  const scene = new Scene('#scene');
  const globe = new Globe('#map', world);

  const entries = {};

  gallery
    .sort(function (a, b) {
      return new Date(a.date) > new Date(b.date) ? -1 : 1;
    })
    .filter(function (entry) {
      return entry.type === 'single';
    })
    .slice(0, 50)
    .forEach(function (entry) {
      // workaround for Gallery API using internal URLs
      const match = internalURL.exec(entry.link);
      if (match) {
        entry.link = externalURL + '/' + match[1]; // eslint-disable-line
      }

      entries[entry.id] = entry;
    });

  const player = new Player(entries, scene, globe);

  d3.select('#map').on('click', function () {
    player.new();
  });

  d3.select('body').on('keydown', function (event) {
    switch (event.code) {
      case 'ArrowRight':
        player.next();
        break;
      case 'ArrowLeft':
        player.previous();
        document.body.focus();
        break;
      default:
      // pass
    }
  });

  player.new();
}
