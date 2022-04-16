import MockStorage from 'dom-storage';

let localStorage;

export function addGlobals(done) {
  localStorage = global.localStorage;
  global.localStorage = new MockStorage(null, {strict: true});
  done();
}

export function restoreGlobals(done) {
  if (localStorage) {
    global.localStorage = localStorage;
  } else {
    delete global.localStorage;
  }
  done();
}
