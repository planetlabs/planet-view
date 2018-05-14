var lab = (exports.lab = require('lab').script());
var expect = require('code').expect;
var Store = require('../src/store');
var util = require('../src/util');

lab.experiment('Store', function() {
  lab.beforeEach(util.addGlobals);

  lab.afterEach(util.restoreGlobals);

  lab.test('constructor', function(done) {
    var store = new Store();
    expect(store).to.be.an.instanceof(Store);
    done();
  });

  lab.test('#get()', function(done) {
    var store = new Store();
    expect(store.get('foo')).to.be.undefined();

    var bar = {bam: 'baz'};
    store.set('foo', bar);
    expect(store.get('foo')).to.deep.equal(bar);
    done();
  });

  lab.test('#set()', function(done) {
    var store = new Store();
    store.set('foo', 'bar');
    expect(store.get('foo')).to.equal('bar');
    done();
  });

  lab.test('#remove()', function(done) {
    var store = new Store();
    store.set('foo', 'bar');
    expect(store.get('foo')).to.equal('bar');

    store.remove('foo');
    expect(store.get('foo')).to.be.undefined();
    done();
  });
});
