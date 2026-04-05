var test  = require('node:test');
var assert  = require('node:assert/strict');

var { loadWithMocks }  = require('../helpers/module-loader');

test('compare model findPartsByIds queries parts with category names for placeholders', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 1, category_name: 'Engine' }]];
    }
  };

  let compareModel = loadWithMocks('../../src/models/compare.model.js', {
    '../config/db': db
  });

  let result = await compareModel.findPartsByIds([1, 2]);

  assert.match(calls[0][0], /WHERE p.id IN \(\?,\?\)/);
  assert.deepEqual(calls[0][1], [1, 2]);
  assert.deepEqual(result, [{ id: 1, category_name: 'Engine' }]);
});
