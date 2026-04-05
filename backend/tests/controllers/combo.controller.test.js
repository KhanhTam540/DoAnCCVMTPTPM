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

test('getComboDetails returns 404 when combo model cannot find combo info', async () => {
  let receivedArgs;
  let comboModel = {
    findComboById: async (...args) => {
      receivedArgs = args;
      return [];
    }
  };

  let controller = loadWithMocks('../../src/controllers/combo.controller.js', {
    '../models/combo.model': comboModel
  });

  let response = createResponse();

  await controller.getComboDetails({ params: { id: '12' } }, response);

  assert.deepEqual(receivedArgs, ['12']);
  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Không tìm thấy combo'
  });
});
