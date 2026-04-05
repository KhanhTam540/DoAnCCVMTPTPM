var test  = require('node:test');
var assert  = require('node:assert/strict');

var { loadWithMocks }  = require('../helpers/module-loader');

test('year model compatibility query joins parts and categories ordered by part name', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 9, name: 'Oil Filter', category_name: 'Filters' }]];
    }
  };

  let yearModel = loadWithMocks('../../src/models/year.model.js', {
    '../config/db': db
  });

  let result = await yearModel.findPartsByModelYearId(7);

  assert.deepEqual(calls, [[
    `SELECT p.*, c.name as category_name
       FROM parts p
       JOIN part_compatibility pc ON p.id = pc.part_id
       JOIN categories c ON p.category_id = c.id
       WHERE pc.model_year_id = ?
       ORDER BY p.name`,
    [7]
  ]]);
  assert.deepEqual(result, [{ id: 9, name: 'Oil Filter', category_name: 'Filters' }]);
});
