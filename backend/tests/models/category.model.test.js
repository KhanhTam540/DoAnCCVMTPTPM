var test  = require('node:test');
var assert  = require('node:assert/strict');

var { loadWithMocks }  = require('../helpers/module-loader');

test('category model updateCategoryById updates category name by id', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [{ affectedRows: 0 }];
    }
  };

  let categoryModel = loadWithMocks('../../src/models/category.model.js', {
    '../config/db': db
  });

  let result = await categoryModel.updateCategoryById(7, 'Engine');

  assert.deepEqual(calls, [[
    'UPDATE categories SET name = ? WHERE id = ?',
    ['Engine', 7]
  ]]);
  assert.deepEqual(result, { affectedRows: 0 });
});
