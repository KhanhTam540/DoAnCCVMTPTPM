var test  = require('node:test');
var assert  = require('node:assert/strict');

var { loadWithMocks }  = require('../helpers/module-loader');

let createResponse = () => ({
  statusCode: 200,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  }
});

test('getCompareData returns 404 when compare model finds no products', async () => {
  let receivedArgs;
  let compareModel = {
    findPartsByIds: async (...args) => {
      receivedArgs = args;
      return [];
    }
  };

  let { getCompareData } = loadWithMocks('../../src/controllers/compare.controller.js', {
    '../models/compare.model': compareModel
  });

  let response = createResponse();

  await getCompareData({ query: { ids: '1,2' } }, response);

  assert.deepEqual(receivedArgs, [[1, 2]]);
  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'No products found'
  });
});
