var test  = require('node:test');
var assert  = require('node:assert/strict');

var { loadWithMocks }  = require('../helpers/module-loader');

test('user model findProfileById queries user profile with grouped roles', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 42, username: 'alice', roles: 'user' }]];
    }
  };

  let userModel = loadWithMocks('../../src/models/user.model.js', {
    '../config/db': db
  });

  let result = await userModel.findProfileById(42);

  assert.equal(calls[0][1][0], 42);
  assert.match(calls[0][0], /GROUP_CONCAT\(r\.name\) as roles/);
  assert.deepEqual(result, [{ id: 42, username: 'alice', roles: 'user' }]);
});

test('user model updatePasswordByUserId updates stored password hash', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [{ affectedRows: 1 }];
    }
  };

  let userModel = loadWithMocks('../../src/models/user.model.js', {
    '../config/db': db
  });

  let result = await userModel.updatePasswordByUserId(9, 'hashed-password');

  assert.deepEqual(calls, [[
    'UPDATE users SET password = ? WHERE id = ?',
    ['hashed-password', 9]
  ]]);
  assert.deepEqual(result, { affectedRows: 1 });
});
