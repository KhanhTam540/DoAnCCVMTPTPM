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

test('updateCategory returns 404 when category model updates no row', async () => {
  let receivedArgs;
  let categoryModel = {
    updateCategoryById: async (...args) => {
      receivedArgs = args;
      return { affectedRows: 0 };
    }
  };

  let { updateCategory } = loadWithMocks('../../src/controllers/category.controller.js', {
    '../models/category.model': categoryModel
  });

  let response = createResponse();

  await updateCategory({ params: { id: '7' }, body: { name: 'Engine' } }, response);

  assert.deepEqual(receivedArgs, ['7', 'Engine']);
  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Category not found'
  });
});
