var d3 = require('d3');
var topojson = require('topojson');

/**
 * Rendering of a globe.
 * @param {string} selector Selector for target element containing the globe.
 * @param {Object} data Parsed topojson for the world.
 * @constructor
 */
function Globe(selector, data) {
  var diameter = 80;

  var projection = d3.geo
    .orthographic()
    .scale(diameter / 2 - 2)
    .translate([diameter / 2, diameter / 2])
    .clipAngle(90);

  var canvas = d3
    .select(selector)
    .append('canvas')
    .attr('width', diameter)
    .attr('height', diameter);

  var context = canvas.node().getContext('2d');

  this.context = context;
  this.path = d3.geo
    .path()
    .projection(projection)
    .context(context);
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
  var circle = d3.geo
    .circle()
    .origin(point)
    .angle(6)();
  var rotate = d3.interpolate(this.projection.rotate(), [-point[0], -point[1]]);
  var self = this;
  d3
    .transition()
    .duration(1250)
    .tween('rotate', function() {
      return function(t) {
        self.projection.rotate(rotate(t));
        self.render(circle);
      };
    });
};

module.exports = Globe;
