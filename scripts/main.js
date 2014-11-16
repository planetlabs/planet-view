var galleryUrl = 'https://www.planet.com/gallery-atom.xml';

// navigation to other chrome pages
d3.selectAll('a[data-hook="chrome-link"]').on('click', function() {
  d3.event.preventDefault();
  chrome.tabs.update({url: d3.event.target.href});
});

// trigger data loading
queue()
    .defer(d3.json, 'data/world-110m.json')
    .defer(d3.xml, galleryUrl)
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
  var entries = parse(gallery);
  var scene = new Scene('#scene');
  var globe = new Globe('#map', world);

  d3.select('#map').on('click', function() {
    showRandom(entries, scene, globe);
  });

  showRandom(entries, scene, globe);
}

/**
 * Show a random scene.
 * @param {Array.<Object>} entries List of parsed gallery entries.
 * @param {Scene} scene Scene object.
 * @param {Globe} globe Globe object.
 */
function showRandom(entries, scene, globe) {
  var entry = entries[Math.floor(Math.random() * entries.length)];

  scene.show(entry);
  globe.show(entry.center);
}

/**
 * Parse the gallery feed.
 * @param {Document} gallery Gallery feed.
 * @return {Array.<Object>} List of parsed entries.
 */
function parse(gallery) {
  var entries = [];
  d3.select(gallery).selectAll('entry').each(function() {
    var entry = d3.select(this);
    var title = entry.select('title').text();

    var link = entry.select('link[rel="alternate"][type="text/html"]')
        .attr('href');

    var image = entry.select('link[rel="enclosure"][type="image/jpeg"]')
        .attr('href');

    var points = this.getElementsByTagNameNS('http://www.georss.org/georss',
        'point');
    if (points.length !== 1) {
      console.log('Expected georss:point in entry', entry);
      return;
    }
    var center = points[0].textContent.split(/\s*[,\s]\s*/).reverse();

    entries.push({
      title: title,
      link: link,
      image: image,
      center: center,
    });
  });
  return entries;
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
  d3.select('#image-title')
      .html('<a href="' + data.link + '">' + data.title + '</a>');
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
    }
  });
};

