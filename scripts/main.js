// var galleryUrl = 'https://www.planet.com/gallery_rss.xml';
var galleryUrl = 'data/gallery_rss.xml';

// navigation to other chrome pages
d3.selectAll('.page-link').on('click', function() {
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
  var items = parse(gallery);
  var scene = new Scene('#scene');
  var globe = new Globe('#map', world);

  d3.select('#map').on('click', function() {
    showRandom(items, scene, globe);
  });

  showRandom(items, scene, globe);
}

/**
 * Show a random scene.
 * @param {Array.<Object>} items List of parsed gallery entries.
 * @param {Scene} scene Scene object.
 * @param {Globe} globe Globe object.
 */
function showRandom(items, scene, globe) {
  var item = items[Math.floor(Math.random() * items.length)];

  scene.show(item);
  globe.show(item.center);
}

/**
 * Parse the gallery feed.
 * @param {Document} gallery Gallery feed.
 * @return {Array.<Object>} List of parsed items.
 */
function parse(gallery) {
  var items = [];
  d3.select(gallery).selectAll('item').each(function() {
    var item = d3.select(this);
    var title = item.select('title').text();
    var description = item.select('description').text();
    var link = item.select('link').text();

    var points = this.getElementsByTagNameNS('http://www.georss.org/georss',
        'point');
    if (points.length !== 1) {
      console.log('Expected georss:point in item', item);
      return;
    }
    var center = points[0].textContent.split(/\s*[,\s]\s*/).reverse();

    var match = description.match(/img .*?src="(.*?)"/);
    if (!match) {
      console.log('Expected description to include img', description);
      return;
    }
    items.push({
      title: title,
      link: link,
      center: center,
      image: match[1]
    });
  });
  return items;
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
  d3.select('#image-title').text(data.title);
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

  context.fillStyle = '#666';
  context.beginPath();
  this.path({type: 'Sphere'});
  context.fill();

  context.fillStyle = '#fff';
  context.beginPath();
  this.path(this.land);
  context.fill();

  if (circle) {
    context.fillStyle = '#333';
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

