var test  = require('node:test');
var assert  = require('node:assert/strict');

var { loadWithMocks }  = require('../helpers/module-loader');

test('favorite model findFavoriteByUserAndPart queries favorite_parts by user and part', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 3 }]];
    }
  };

  let favoriteModel = loadWithMocks('../../src/models/favorite.model.js', {
    '../config/db': db
  });

  let result = await favoriteModel.findFavoriteByUserAndPart(4, 9);

  assert.deepEqual(calls, [[
    'SELECT * FROM favorite_parts WHERE user_id = ? AND part_id = ?',
    [4, 9]
  ]]);
  assert.deepEqual(result, [{ id: 3 }]);
});

test('favorite model insertFavorite creates favorite_parts row', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [{ insertId: 10 }];
    }
  };

  let favoriteModel = loadWithMocks('../../src/models/favorite.model.js', {
    '../config/db': db
  });

  let result = await favoriteModel.insertFavorite(4, 9);

  assert.deepEqual(calls, [[
    'INSERT INTO favorite_parts (user_id, part_id) VALUES (?, ?)',
    [4, 9]
  ]]);
  assert.deepEqual(result, { insertId: 10 });
});
