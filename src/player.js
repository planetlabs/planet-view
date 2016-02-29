var Store = require('./store');

var MAX_HISTORY = 50;

/**
 * Shows entries and manages history.
 * @param {Object} entries Gallery entries.
 * @param {Object} scene Scene view.
 * @param {Object} globe Globe view.
 * @constructor
 */
function Player(entries, scene, globe) {
  this.entries = entries;
  this.scene = scene;
  this.globe = globe;
  this.store = new Store();
  this._syncStore();
  this._first = true;
}

/**
 * Show the previous entry.
 */
Player.prototype.previous = function() {
  var history = this.store.get('history');
  var index = history.current + 1;
  if (index < history.entries.length) {
    this._show(history.entries[index]);
    history.current = index;
    this.store.set('history', history);
  }
};

/**
 * Show the next entry.
 */
Player.prototype.next = function() {
  var history = this.store.get('history');
  var index = history.current - 1;
  if (index >= 0) {
    this._show(history.entries[index]);
    history.current = index;
    this.store.set('history', history);
  } else {
    this.new();
  }
};

/**
 * Show a new entry.
 */
Player.prototype.new = function() {
  var entry = this.store.get('next');
  if (!entry) {
    entry = this._getNext();
  } else {
    this.store.remove('next');
  }
  this._show(entry, true);
  var history = this.store.get('history');
  var entries = history.entries;
  entries.unshift(entry);
  if (entries.length > MAX_HISTORY) {
    entries.length = MAX_HISTORY;
  }
  history = {
    current: 0,
    entries: entries
  };
  this.store.set('history', history);
};

/**
 * Get the next (least frequently viewed) entry.
 * @return {Object} Scene data.
 */
Player.prototype._getNext = function() {
  var views = this.store.get('views');
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
  return this.entries[
    candidates[Math.floor(Math.random() * candidates.length)]
  ];
};

/**
 * Preload the next image.
 */
Player.prototype._preloadNext = function() {
  var entry = this._getNext();
  this.store.set('next', entry);

  var image = new Image();
  image.src = this.scene.getUrl(entry);
};

/**
 * Show the given entry.
 * @param {Object} entry Object with scene info.
 * @param {boolean} isNew Newly viewed image.
 */
Player.prototype._show = function(entry, isNew) {
  if (isNew) {
    this.scene.show(entry, this._preloadNext.bind(this));
  } else {
    this.scene.show(entry);
  }
  var views = this.store.get('views');
  views[entry.id] += 1;
  this.store.set('views', views);
  this.globe.show([entry.lng, entry.lat]);
};

/**
 * Synchronize the views store.  This keeps track of the number of new views per
 * scene and intializes history.
 */
Player.prototype._syncStore = function() {
  var views = this.store.get('views') || {};
  var added = {};
  var current = {};
  var minViews = NaN;
  var id;
  for (id in this.entries) {
    if (id in views) {
      minViews = isNaN(minViews) ? views[id] : Math.min(minViews, views[id]);
      current[id] = views[id];
    } else {
      added[id] = true;
    }
  }
  var unviewed = isNaN(minViews) ? 0 : Math.max(0, minViews - 1);
  for (id in added) {
    current[id] = unviewed;
  }
  this.store.set('views', current);
  if (!this.store.get('history')) {
    var history = {
      current: -1,
      entries: []
    };
    this.store.set('history', history);
  }
};

module.exports = Player;
