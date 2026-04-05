var test  = require('node:test');
var assert  = require('node:assert/strict');

var { loadWithMocks }  = require('../helpers/module-loader');

test('searchHistory model findSearchHistoryByUser queries user history filtered by type and limit', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 4, filters: null }]];
    }
  };

  let searchHistoryModel = loadWithMocks('../../src/models/searchHistory.model.js', {
    '../config/db': db
  });

  let result = await searchHistoryModel.findSearchHistoryByUser(9, 'keyword', 20);

  assert.match(calls[0][0], /WHERE user_id = \? AND search_type = \?/);
  assert.match(calls[0][0], /LIMIT \?/);
  assert.deepEqual(calls[0][1], [9, 'keyword', 20]);
  assert.deepEqual(result, [{ id: 4, filters: null }]);
});
