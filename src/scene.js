var d3 = require('d3');
var moment = require('moment');

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
 * @param {Function} callback Called when the image loads.
 */
Scene.prototype.show = function(data, callback) {
  this.hide();
  var url = this.getUrl(data);
  this.url = url;

  var image = new Image();
  image.onload = function() {
    this._show(url);
    if (callback) {
      callback();
    }
  }.bind(this);
  image.src = url;

  // TODO: rework scene markup
  var title = data.title + ' - ' + moment(data.acquisition_date).calendar();
  d3
    .select('#image-title')
    .html('<a tabindex="1" href="' + data.link + '">' + title + '</a>');
  d3.select('#copyright-year').text(new Date(data.publish_date).getFullYear());
};

/**
 * Handle image loading.
 * @param {string} url The url of the loaded image.
 */
Scene.prototype._show = function(url) {
  if (url !== this.url) {
    // another image is loading
    return;
  }
  this.target.style({
    'background-image': 'url(' + url + ')'
  });
  this.target.classed('shown', true);
};

/**
 * Get the URL for a scene, favoring the full resolution version.
 * @param {Object} data Scene data.
 * @return {string} Scene URL.
 */
Scene.prototype.getUrl = function(data) {
  return data.images.web || data.images.full || data.image;
};

/**
 * Hide a scene.
 */
Scene.prototype.hide = function() {
  delete this.url;
  this.target.classed('shown', false);
};

module.exports = Scene;
