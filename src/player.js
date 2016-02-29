var Store = require('./store');

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
  this._syncStore();
  this._first = true;
  addEventListener('popstate', this._onPopState.bind(this), false);
}

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
  var entry = this.store.get('next');
  if (!entry) {
    entry = this._getNext();
  } else {
    this.store.remove('next');
  }
  var views = this.store.get('views');
  views[entry.id] += 1;
  this.store.set('views', views);
  this._show(entry, true);
  if (!this._first) {
    history.pushState(entry.id, 'New Tab');
  } else {
    history.replaceState(entry.id, 'New Tab');
    this._first = false;
  }
};

/**
 * Show the next entry.
 */
Player.prototype.next = function() {
  history.forward();
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
 * Handle popstate events.
 * @param {PopStateEvent} event Fired with history changes.
 */
Player.prototype._onPopState = function(event) {
  var id = event.state;
  var scene = this.entries[id];
  if (scene) {
    this._show(scene);
  }
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
  this.globe.show([entry.lng, entry.lat]);
};

/**
 * Synchronize the views store.  This keeps track of the number of new views per
 * scene.
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
};

module.exports = Player;
