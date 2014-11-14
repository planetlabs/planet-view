var feedUrl = 'https://www.planet.com/gallery_rss.xml';

$.get(feedUrl, function(data) {
  var images = [];
  $(data).find('item').each(function() {
    var item = $(this);
    var description = $(item.children('description').first().text());
    images.push({
      title: item.children('title').text(),
      src: description[0].src
    });
  });
  var image = images[Math.floor(Math.random() * images.length)];
  $('.background').css({
    backgroundImage: 'url(' + image.src + ')'
  });
  $('#image-title').text(image.title);
});
