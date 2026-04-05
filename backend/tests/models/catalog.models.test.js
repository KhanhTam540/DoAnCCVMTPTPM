var test  = require('node:test');
var assert  = require('node:assert/strict');

var { loadWithMocks }  = require('../helpers/module-loader');

test('brand model findAll queries brands ordered by name', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 1, name: 'Toyota' }]];
    }
  };

  let brandModel = loadWithMocks('../../src/models/brand.model.js', {
    '../config/db': db
  });

  let result = await brandModel.findAll();

  assert.deepEqual(calls, [['SELECT * FROM brands ORDER BY name']]);
  assert.deepEqual(result, [{ id: 1, name: 'Toyota' }]);
});

test('model model findByBrandId queries car_models by brand id', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 3, brand_id: 5, name: 'Accord' }]];
    }
  };

  let modelModel = loadWithMocks('../../src/models/model.model.js', {
    '../config/db': db
  });

  let result = await modelModel.findByBrandId(5);

  assert.deepEqual(calls, [[
    'SELECT * FROM car_models WHERE brand_id = ? ORDER BY name',
    [5]
  ]]);
  assert.deepEqual(result, [{ id: 3, brand_id: 5, name: 'Accord' }]);
});

test('model model findByModelId queries years descending', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 8, model_id: 2, year: 2025 }]];
    }
  };

  let modelModel = loadWithMocks('../../src/models/model.model.js', {
    '../config/db': db
  });

  let result = await modelModel.findByModelId(2);

  assert.deepEqual(calls, [[
    'SELECT * FROM model_years WHERE model_id = ? ORDER BY year DESC',
    [2]
  ]]);
  assert.deepEqual(result, [{ id: 8, model_id: 2, year: 2025 }]);
});
