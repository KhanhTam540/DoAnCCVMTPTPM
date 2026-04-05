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

test('getProfile returns 404 when user model finds no user', async () => {
  let receivedUserId;
  let userModel = {
    findProfileById: async (userId) => {
      receivedUserId = userId;
      return [];
    }
  };

  let { getProfile } = loadWithMocks('../../src/controllers/user.controller.js', {
    '../models/user.model': userModel
  });

  let response = createResponse();

  await getProfile({ user: { id: 42 } }, response);

  assert.equal(receivedUserId, 42);
  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'User not found'
  });
});

test('updateProfile forwards profile updates to user model', async () => {
  let receivedArgs;
  let userModel = {
    updateProfileById: async (...args) => {
      receivedArgs = args;
      return { affectedRows: 1 };
    }
  };

  let { updateProfile } = loadWithMocks('../../src/controllers/user.controller.js', {
    '../models/user.model': userModel
  });

  let response = createResponse();

  await updateProfile({
    user: { id: 9 },
    body: { full_name: 'Alice', phone: '0123', address: 'HN' }
  }, response);

  assert.deepEqual(receivedArgs, [9, { full_name: 'Alice', phone: '0123', address: 'HN' }]);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    success: true,
    message: 'Profile updated successfully'
  });
});

test('changePassword returns 400 when current password is incorrect', async () => {
  let userModel = {
    findPasswordByUserId: async () => [{ password: 'stored-hash' }]
  };

  let { changePassword } = loadWithMocks('../../src/controllers/user.controller.js', {
    '../models/user.model': userModel,
  });

  let response = createResponse();

  await changePassword({
    user: { id: 11 },
    body: { current_password: 'wrong', new_password: 'new-secret' }
  }, response);

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Current password is incorrect'
  });
});
