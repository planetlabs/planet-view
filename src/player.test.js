/* eslint-env jest */
const Player = require('./player');
const util = require('./util');

describe('Player', function() {
  beforeEach(util.addGlobals);

  afterEach(util.restoreGlobals);

  test('constructor', function() {
    const player = new Player();
    expect(player).toBeInstanceOf(Player);

    expect(player.store.get('views')).toEqual({});
    expect(player.store.get('history')).toEqual({
      current: -1,
      entries: [],
    });
  });

  test('#_syncStore()', function() {
    const player = new Player();

    player.entries = {
      one: true,
      two: true,
      three: true,
    };

    player._syncStore();
    expect(player.store.get('views')).toEqual({
      one: 0,
      two: 0,
      three: 0,
    });
  });

  test('#_syncStore() - new entry', function() {
    const player = new Player();

    player.store.set('views', {
      one: 1,
      two: 1,
      three: 1,
    });

    player.entries = {
      one: true,
      two: true,
      three: true,
      four: true,
    };

    player._syncStore();
    expect(player.store.get('views')).toEqual({
      one: 1,
      two: 1,
      three: 1,
      four: 0,
    });
  });

  test('#_syncStore() - new entry, many previous views', function() {
    const player = new Player();

    player.store.set('views', {
      one: 10,
      two: 11,
      three: 11,
    });

    player.entries = {
      one: true,
      two: true,
      three: true,
      four: true,
    };

    player._syncStore();
    expect(player.store.get('views')).toEqual({
      one: 10,
      two: 11,
      three: 11,
      four: 9,
    });
  });
});
