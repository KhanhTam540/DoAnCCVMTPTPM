var test  = require('node:test');
var assert  = require('node:assert/strict');

var { loadWithMocks }  = require('../helpers/module-loader');

test('vin model findWmiMapping queries WMI mapping with joined brand data', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ brand_id: 3, brand_name: 'Honda' }]];
    }
  };

  let vinModel = loadWithMocks('../../src/models/vin.model.js', {
    '../config/db': db
  });

  let result = await vinModel.findWmiMapping('1HG');

  assert.equal(calls[0][1][0], '1HG');
  assert.match(calls[0][0], /FROM vin_wmi_mappings vwm/);
  assert.deepEqual(result, [{ brand_id: 3, brand_name: 'Honda' }]);
});
