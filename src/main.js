import * as d3 from 'd3';
import Globe from './Globe.js';
import Player from './Player.js';
import Scene from './Scene.js';
import world from './assets/data/world-110m.json';

const postsURL = 'https://assets.planet.com/gallery_posts.json';
const postIdFromLink = /#!\/post\/([^/?#]+)/;

// trigger data loading
fetch(postsURL)
  .then(response => response.json())
  .then(ready)
  .catch(err => console.error(err)); // eslint-disable-line

/**
 * Handle loaded data.
 * @param {Array} gallery Gallery posts.
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
      return entry.type === 'single' && hasValidCoordinates(entry);
    })
    .slice(0, 50)
    .forEach(function (entry) {
      const match = postIdFromLink.exec(entry.link);
      entry.id = match ? match[1] : entry.link;
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

/**
 * Check whether a post has usable geographic coordinates.
 * @param {Object} entry Gallery post.
 * @return {boolean} True if coordinates are valid lon/lat.
 */
function hasValidCoordinates(entry) {
  const coordinates = entry.coordinates;
  return (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    Math.abs(coordinates[0]) <= 180 &&
    Math.abs(coordinates[1]) <= 90
  );
}
