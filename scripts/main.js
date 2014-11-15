// var galleryUrl = 'https://www.planet.com/gallery_rss.xml';
var galleryUrl = 'data/gallery_rss.xml';

d3.selectAll('.page-link').on('click', function() {
  d3.event.preventDefault();
  chrome.tabs.update({url: d3.event.target.href});
});

queue()
    .defer(d3.json, 'data/world-110m.json')
    .defer(d3.xml, galleryUrl)
    .await(ready);

function ready(err, world, gallery) {
  if (err) {
    console.error(err);
    return;
  }
  var items = parse(gallery);
  var globe = new Globe('#map', world);

  var item = items[Math.floor(Math.random() * items.length)];
  d3.select('#image-title').text(item.title);
  d3.select('.background').style({
    'background-image': 'url(' + item.image + ')'
  });

  globe.show(item.center);
}

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

