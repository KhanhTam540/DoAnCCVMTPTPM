var test  = require('node:test');
var assert  = require('node:assert/strict');

var { loadWithMocks }  = require('../helpers/module-loader');

test('imageSearch model findPartsByImageSearch queries ranked part results with supplied params', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 11, relevance_score: 8 }]];
    }
  };

  let imageSearchModel = loadWithMocks('../../src/models/imageSearch.model.js', {
    '../config/db': db
  });

  let result = await imageSearchModel.findPartsByImageSearch(
    'SELECT DISTINCT p.*, 8 as relevance_score FROM parts p LIMIT ? OFFSET ?',
    [12, 0]
  );

  assert.deepEqual(calls, [[
    'SELECT DISTINCT p.*, 8 as relevance_score FROM parts p LIMIT ? OFFSET ?',
    [12, 0]
  ]]);
  assert.deepEqual(result, [{ id: 11, relevance_score: 8 }]);
});
