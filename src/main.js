var d3 = require('d3');
var queue = require('queue-async');

var Globe = require('./globe');
var Player = require('./player');
var Scene = require('./scene');

// navigation to other chrome pages
d3.selectAll('a[data-hook="chrome-link"]').on('click', function() {
  d3.event.preventDefault();
  chrome.tabs.update({url: d3.event.currentTarget.href});
});

// trigger data loading
queue()
  .defer(d3.json, 'assets/data/world-110m.json')
  .defer(d3.json, 'https://api.planet.com/gallery/v1/posts')
  .await(ready);

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
  var entry;
  var old = new Date();
  old.setFullYear(old.getFullYear() - 1);

  for (var i = 0, ii = gallery.length; i < ii; ++i) {
    entry = gallery[i];
    // assume link is stable identifier
    entry.id = entry.link;
    entries[entry.id] = entry;
  }

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
