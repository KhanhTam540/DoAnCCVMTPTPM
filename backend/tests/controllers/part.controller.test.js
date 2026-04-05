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

test('deletePart returns 404 when part model deletes no row', async () => {
  let receivedArgs;
  let partModel = {
    deletePartById: async (...args) => {
      receivedArgs = args;
      return { affectedRows: 0 };
    }
  };

  let { deletePart } = loadWithMocks('../../src/controllers/part.controller.js', {
    '../models/part.model': partModel
  });

  let response = createResponse();

  await deletePart({ params: { id: '15' } }, response);

  assert.deepEqual(receivedArgs, ['15']);
  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Part not found'
  });
});
