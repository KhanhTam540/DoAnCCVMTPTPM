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

test('getFavorites returns data from favorite model', async () => {
  let receivedUserId;
  let favoriteModel = {
    findFavoritesByUserId: async (userId) => {
      receivedUserId = userId;
      return [{ id: 1, name: 'Brake Pad' }];
    }
  };

  let { getFavorites } = loadWithMocks('../../src/controllers/favorite.controller.js', {
    '../models/favorite.model': favoriteModel
  });

  let response = createResponse();

  await getFavorites({ user: { id: 4 } }, response);

  assert.equal(receivedUserId, 4);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    success: true,
    data: [{ id: 1, name: 'Brake Pad' }]
  });
});

test('toggleFavorite removes favorite when model reports an existing row', async () => {
  let removedArgs;
  let favoriteModel = {
    findFavoriteByUserAndPart: async () => [{ id: 3 }],
    deleteFavoriteByUserAndPart: async (...args) => {
      removedArgs = args;
    }
  };

  let { toggleFavorite } = loadWithMocks('../../src/controllers/favorite.controller.js', {
    '../models/favorite.model': favoriteModel
  });

  let response = createResponse();

  await toggleFavorite({ user: { id: 4 }, body: { partId: 9 } }, response);

  assert.deepEqual(removedArgs, [4, 9]);
  assert.deepEqual(response.body, {
    success: true,
    isFavorite: false,
    message: 'Đã bỏ yêu thích'
  });
});

test('checkFavorite returns false when favorite model finds no row', async () => {
  let favoriteModel = {
    findFavoriteByUserAndPart: async () => []
  };

  let { checkFavorite } = loadWithMocks('../../src/controllers/favorite.controller.js', {
    '../models/favorite.model': favoriteModel
  });

  let response = createResponse();

  await checkFavorite({ user: { id: 4 }, params: { partId: '9' } }, response);

  assert.deepEqual(response.body, {
    success: true,
    isFavorite: false
  });
});
