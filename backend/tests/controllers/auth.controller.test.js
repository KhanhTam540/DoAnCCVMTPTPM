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

test('register returns 409 when auth model reports duplicate username or email', async () => {
  let receivedArgs;
  let authModel = {
    findUserIdByUsernameOrEmail: async (...args) => {
      receivedArgs = args;
      return [{ id: 7 }];
    }
  };

  let { register } = loadWithMocks('../../src/controllers/auth.controller.js', {
    '../models/auth.model': authModel
  });

  let response = createResponse();

  await register({ body: { username: 'alice', password: 'secret', email: 'alice@example.com' } }, response);

  assert.deepEqual(receivedArgs, ['alice', 'alice@example.com']);
  assert.equal(response.statusCode, 409);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Username or email already exists'
  });
});

test('verifyOtp returns 404 when auth model cannot find user by email', async () => {
  let receivedEmail;
  let authModel = {
    findUserIdByEmail: async (email) => {
      receivedEmail = email;
      return [];
    }
  };

  let { verifyOtp } = loadWithMocks('../../src/controllers/auth.controller.js', {
    '../models/auth.model': authModel
  });

  let response = createResponse();

  await verifyOtp({ body: { email: 'missing@example.com', otp_code: '123456' } }, response);

  assert.equal(receivedEmail, 'missing@example.com');
  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'User not found'
  });
});

test('login returns 401 when auth model finds no matching user', async () => {
  let receivedUsername;
  let authModel = {
    findLoginUserByUsername: async (username) => {
      receivedUsername = username;
      return [];
    }
  };

  let { login } = loadWithMocks('../../src/controllers/auth.controller.js', {
    '../models/auth.model': authModel
  });

  let response = createResponse();

  await login({ body: { username: 'ghost', password: 'secret' } }, response);

  assert.equal(receivedUsername, 'ghost');
  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Invalid username or password'
  });
});
