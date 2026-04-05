var test  = require('node:test');
var assert  = require('node:assert/strict');

var { loadWithMocks }  = require('../helpers/module-loader');

test('combo model findComboById queries combo part details by id', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 12, is_combo: 1 }]];
    }
  };

  let comboModel = loadWithMocks('../../src/models/combo.model.js', {
    '../config/db': db
  });

  let result = await comboModel.findComboById(12);

  assert.equal(calls[0][1][0], 12);
  assert.match(calls[0][0], /WHERE p.id = \? AND p.is_combo = TRUE/);
  assert.deepEqual(result, [{ id: 12, is_combo: 1 }]);
});
