var test  = require('node:test');
var assert  = require('node:assert/strict');

var { loadWithMocks }  = require('../helpers/module-loader');

test('part model deletePartById deletes part by id', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [{ affectedRows: 0 }];
    }
  };

  let partModel = loadWithMocks('../../src/models/part.model.js', {
    '../config/db': db
  });

  let result = await partModel.deletePartById(15);

  assert.deepEqual(calls, [[
    'DELETE FROM parts WHERE id = ?',
    [15]
  ]]);
  assert.deepEqual(result, { affectedRows: 0 });
});
