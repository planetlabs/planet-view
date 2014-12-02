var d3 = require('d3');
var moment = require('moment');
var queue = require('queue-async');
var topojson = require('topojson');

var galleryUrl = 'https://www.planet.com/gallery.json';

// navigation to other chrome pages
d3.selectAll('a[data-hook="chrome-link"]').on('click', function() {
  d3.event.preventDefault();
  chrome.tabs.update({url: d3.event.currentTarget.href});
});

// trigger data loading
queue()
    .defer(d3.json, 'assets/data/world-110m.json')
    .defer(d3.json, galleryUrl)
    .await(ready);

/**
 * Handle loaded data.
 * @param {Error} err Network error.
 * @param {Object} world Land and country data.
 * @param {Document} gallery Gallery feed.
 */
function ready(err, world, gallery) {
  if (err) {
    console.error(err);
    return;
  }
  var scene = new Scene('#scene');
  var globe = new Globe('#map', world);

  var player = new Player(gallery, scene, globe);

  d3.select('#map').on('click', function() {
    player.new();
  });

  player.new();
}

/**
 * Object for displaying a single image.
 * @param {string} selector Selector for target element containing the scene.
 * @constructor
 */
function Scene(selector) {
  this.target = d3.select(selector);
}

/**
 * Show a scene.
 * @param {Object} data Data for an individual scene.
 */
Scene.prototype.show = function(data) {
  this.hide();
  this.url = data.image;

  var image = new Image();
  image.onload = this._show.bind(this, data.image);
  image.src = data.image;

  // TODO: rework scene markup
  var title = data.title + ' (' + moment(data.acquisition_date).calendar()
    + ')';
  d3.select('#image-title')
      .html('<a href="' + data.link + '">' + title + '</a>');
};

/**
 * Handle image loading.
 * @param {string} url The url of the loaded image.
 */
Scene.prototype._show = function(url) {
  if (url != this.url) {
    // another image is loading
    return;
  }
  this.target.style({
    'background-image': 'url(' + url + ')'
  });
  this.target.classed('shown', true);
};

/**
 * Hide a scene.
 */
Scene.prototype.hide = function() {
  delete this.url;
  this.target.classed('shown', false);
};

/**
 * Rendering of a globe.
 * @param {string} selector Selector for target element containing the globe.
 * @param {Object} data Parsed topojson for the world.
 * @constructor
 */
function Globe(selector, data) {
  var diameter = 80;

  var projection = d3.geo.orthographic()
      .scale((diameter / 2) - 2)
      .translate([diameter / 2, diameter / 2])
      .clipAngle(90);

  var canvas = d3.select(selector).append('canvas')
      .attr('width', diameter)
      .attr('height', diameter);

  var context = canvas.node().getContext('2d');

  this.context = context;
  this.path = d3.geo.path().projection(projection).context(context);
  this.projection = projection;

  this.land = topojson.feature(data, data.objects.land);
  this.render();
}

/**
 * Render the globe with an optional locator circle.
 * @param {Object} circle Data for the optional locator circle.
 */
Globe.prototype.render = function(circle) {
  var context = this.context;
  var diameter = context.canvas.width;

  context.clearRect(0, 0, diameter, diameter);

  context.globalAlpha = 0.5;
  context.fillStyle = '#666';
  context.beginPath();
  this.path({type: 'Sphere'});
  context.fill();
  context.globalAlpha = 1;

  context.fillStyle = '#fff';
  context.beginPath();
  this.path(this.land);
  context.fill();

  if (circle) {
    context.fillStyle = '#18aae6';
    context.beginPath();
    this.path(circle);
    context.fill();
  }
};

/**
 * Rotate the globe to show the given point.
 * @param {Array.<number>} point Geographic location (lon, lat).
 */
Globe.prototype.show = function(point) {
  var circle = d3.geo.circle().origin(point).angle(6)();
  var rotate = d3.interpolate(this.projection.rotate(),
      [-point[0], -point[1]]);
  var self = this;
  d3.transition().duration(1250).tween('rotate', function() {
    return function(t) {
      self.projection.rotate(rotate(t));
      self.render(circle);
    };
  });
};

/**
 * Shows entries and manages history.
 * @param {Object} entries Gallery entries.
 * @param {[type]} scene Scene view.
 * @param {[type]} globe Globe view.
 * @constructor
 */
function Player(entries, scene, globe) {
  this.entries = entries;
  this.scene = scene;
  this.globe = globe;
  this.store = new Store();
  this.syncStore();
  addEventListener('popstate', this.onPopState.bind(this), false);
}

/**
 * Synchronize the views store.  This keeps track of the number of new views per
 * scene.
 */
Player.prototype.syncStore = function() {
  var store = this.store;
  var values = store.values();
  var current = {};
  var id;
  for (id in this.entries) {
    if (!(id in values)) {
      store.set(id, 0);
    }
    current[id] = true;
  }
  for (id in values) {
    if (!current[id]) {
      store.remove(id);
    }
  }
};

/**
 * Handle popstate events.
 * @param {PopStateEvent} event Fired with history changes.
 */
Player.prototype.onPopState = function(event) {
  var id = event.state;
  var scene = this.entries[id];
  if (scene) {
    this.show(scene);
  }
};

/**
 * Show the next entry.
 */
Player.prototype.next = function() {
  history.forward();
};

/**
 * Show the previous entry.
 */
Player.prototype.previous = function() {
  history.back();
};

/**
 * Show a new entry.
 */
Player.prototype.new = function() {
  var store = this.store;
  var views = store.values();
  var hits = {};
  var min = Number.POSITIVE_INFINITY;
  for (var id in views) {
    var count = views[id];
    if (count in hits) {
      hits[count].push(id);
    } else {
      hits[count] = [id];
    }
    if (count < min) {
      min = count;
    }
  }
  var candidates = hits[min];
  var entry = this.entries[
    candidates[Math.floor(Math.random() * candidates.length)]
  ];

  this.show(entry);
  this.store.set(entry.id, min + 1);
  if (history.state) {
    history.pushState(entry.id);
  } else {
    history.replaceState(entry.id);
  }
};

/**
 * Show the given entry.
 * @param {Object} entry Object with scene info.
 */
Player.prototype.show = function(entry) {
  this.scene.show(entry);
  this.globe.show([entry.lng, entry.lat]);
};

/**
 * Simple object store backed by localStorage.
 * @constructor
 */
function Store() {
  this.id = Store.getId();
  if (!localStorage[this.id]) {
    localStorage[this.id] = '{}';
  }
}

/**
 * Get all values.
 * @return {Object} Store values.
 */
Store.prototype.values = function() {
  return JSON.parse(localStorage[this.id]);
};

/**
 * Get a stored value.
 * @param {string} key The key.
 * @return {*} The value.
 */
Store.prototype.get = function(key) {
  return this.values()[key];
};

/**
 * Set a value.
 * @param {string} key The key.
 * @param {*} value The value.
 */
Store.prototype.set = function(key, value) {
  var values = this.values();
  values[key] = value;
  localStorage[this.id] = JSON.stringify(values);
};

/**
 * Remove a key.
 * @param {string} key The key.
 */
Store.prototype.remove = function(key) {
  var values = this.values();
  delete values[key];
  localStorage[this.id] = JSON.stringify(values);
};

/**
 * Store count.
 * @type {number}
 */
Store.count = 0;

/**
 * Get a unique id for this session.
 * @return {string} Unique id.
 */
Store.getId = function() {
  ++Store.count;
  return 'planet-view-' + Store.count;
};
