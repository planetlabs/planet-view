/* eslint-env jest */
const Store = require('./store');
const util = require('./util');

describe('Store', function() {
  beforeEach(util.addGlobals);

  afterEach(util.restoreGlobals);

  test('constructor', function() {
    const store = new Store();
    expect(store).toBeInstanceOf(Store);
  });

  test('#get()', function() {
    const store = new Store();
    expect(store.get('foo')).toBeUndefined();

    const bar = {bam: 'baz'};
    store.set('foo', bar);
    expect(store.get('foo')).toEqual(bar);
  });

  test('#set()', function() {
    const store = new Store();
    store.set('foo', 'bar');
    expect(store.get('foo')).toEqual('bar');
  });

  test('#remove()', function() {
    const store = new Store();
    store.set('foo', 'bar');
    expect(store.get('foo')).toEqual('bar');

    store.remove('foo');
    expect(store.get('foo')).toBeUndefined();
  });
});
