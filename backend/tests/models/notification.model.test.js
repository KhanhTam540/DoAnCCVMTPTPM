var test  = require('node:test');
var assert  = require('node:assert/strict');

var { loadWithMocks }  = require('../helpers/module-loader');

test('notification model findNotificationsByUserId queries latest notifications', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 1 }]];
    }
  };

  let notificationModel = loadWithMocks('../../src/models/notification.model.js', {
    '../config/db': db
  });

  let result = await notificationModel.findNotificationsByUserId(5);

  assert.equal(calls[0][1][0], 5);
  assert.match(calls[0][0], /ORDER BY created_at DESC/);
  assert.deepEqual(result, [{ id: 1 }]);
});

test('notification model markAsReadById updates notification ownership row', async () => {
  let calls = [];
  let db = {
    query: async (...args) => {
      calls.push(args);
      return [{ affectedRows: 0 }];
    }
  };

  let notificationModel = loadWithMocks('../../src/models/notification.model.js', {
    '../config/db': db
  });

  let result = await notificationModel.markAsReadById(9, 5);

  assert.deepEqual(calls, [[
    'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
    [9, 5]
  ]]);
  assert.deepEqual(result, { affectedRows: 0 });
});
