/**
 * Store count.
 * @type {number}
 */
let count = 0;

/**
 * Store prefix.
 * @type {string}
 */
const prefix = 'planet-view-1';

/**
 * Get a unique id for this session.
 * @return {string} Unique id.
 */
function getId() {
  ++count;
  return prefix + '-' + count;
}

/**
 * Simple object store backed by localStorage.  Identifiers handed out in
 * construction order.
 * @constructor
 */
function Store() {
  this.id = getId();
  if (!localStorage[this.id]) {
    localStorage[this.id] = '{}';
  }
}

/**
 * Get a stored value.
 * @param {string} key The key.
 * @return {*} The value.
 */
Store.prototype.get = function(key) {
  return this._getValues()[key];
};

/**
 * Remove a key.
 * @param {string} key The key.
 */
Store.prototype.remove = function(key) {
  const values = this._getValues();
  delete values[key];
  this._setValues(values);
};

/**
 * Set a value.
 * @param {string} key The key.
 * @param {*} value The value.
 */
Store.prototype.set = function(key, value) {
  const values = this._getValues();
  values[key] = value;
  this._setValues(values);
};

/**
 * Get all values.
 * @return {Object} Store values.
 */
Store.prototype._getValues = function() {
  return JSON.parse(localStorage[this.id]);
};

/**
 * Set all values.
 * @param {Object} values Store values.
 */
Store.prototype._setValues = function(values) {
  localStorage[this.id] = JSON.stringify(values);
};

module.exports = Store;
