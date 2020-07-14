const MockStorage = require('dom-storage');

let localStorage;

exports.addGlobals = function(done) {
  localStorage = global.localStorage;
  global.localStorage = new MockStorage(null, {strict: true});
  done();
};

exports.restoreGlobals = function(done) {
  if (localStorage) {
    global.localStorage = localStorage;
  } else {
    delete global.localStorage;
  }
  done();
};
