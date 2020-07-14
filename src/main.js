var d3 = require('d3');
var queue = require('queue-async');

var Globe = require('./globe');
var Player = require('./player');
var Scene = require('./scene');

// trigger data loading
queue()
  .defer(d3.json, 'assets/data/world-110m.json')
  .defer(d3.json, 'https://api.planet.com/gallery/v1/posts')
  .await(ready);

const internalURL = /gallery\.prod\.planet-labs\.com\/gallery\/v1\/posts\/(.*)$/;
const externalURL = 'https://www.planet.com/gallery/#!/post';

/**
 * Handle loaded data.
 * @param {Error} err Network error.
 * @param {Object} world Land and country data.
 * @param {Document} gallery Gallery feed.
 */
function ready(err, world, gallery) {
  if (err) {
    throw err;
  }
  var scene = new Scene('#scene');
  var globe = new Globe('#map', world);

  var entries = {};

  gallery
    .sort(function(a, b) {
      return new Date(a.date) > new Date(b.date) ? -1 : 1;
    })
    .filter(function(entry) {
      return entry.type === 'single';
    })
    .slice(0, 50)
    .forEach(function(entry) {
      // workaround for Gallery API using internal URLs
      const match = internalURL.exec(entry.link);
      if (match) {
        entry.link = externalURL + '/' + match[1]; // eslint-disable-line
      }

      entries[entry.id] = entry;
    });

  var player = new Player(entries, scene, globe);

  d3.select('#map').on('click', function() {
    player.new();
  });

  d3.select('body').on('keydown', function() {
    switch (d3.event.keyCode) {
      case 39:
        player.next();
        break;
      case 37:
        player.previous();
        document.body.focus();
        break;
      default:
      // pass
    }
  });

  player.new();
}
