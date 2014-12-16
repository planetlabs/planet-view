var MockStorage = require('dom-storage');
var sinon = require('sinon');

exports.addGlobals = function(done) {
  global.localStorage = new MockStorage(null, {strict: true});
  global.addEventListener = sinon.spy();
  done();
};

exports.removeGlobals = function(done) {
  delete global.localStorage;
  delete global.addEventListener;
  done();
};
