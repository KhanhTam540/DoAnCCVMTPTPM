var test  = require('node:test');
var assert  = require('node:assert/strict');

var { loadWithMocks }  = require('../helpers/module-loader');

test('admin model findAllUsers queries users ordered by created date with grouped roles', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 1, username: 'admin1', roles: 'admin' }]];
    }
  };

  let adminModel = loadWithMocks('../../src/models/admin.model.js', {
    '../config/db': db
  });

  let result = await adminModel.findAllUsers();

  assert.match(calls[0][0], /GROUP_CONCAT\(r\.name\) as roles/);
  assert.match(calls[0][0], /ORDER BY u\.created_at DESC/);
  assert.deepEqual(result, [{ id: 1, username: 'admin1', roles: 'admin' }]);
});

test('admin model updateUserStatusById updates user active flag by id', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [{ affectedRows: 0 }];
    }
  };

  let adminModel = loadWithMocks('../../src/models/admin.model.js', {
    '../config/db': db
  });

  let result = await adminModel.updateUserStatusById(3, 0);

  assert.deepEqual(calls, [[
    'UPDATE users SET is_active = ? WHERE id = ?',
    [0, 3]
  ]]);
  assert.deepEqual(result, { affectedRows: 0 });
});
