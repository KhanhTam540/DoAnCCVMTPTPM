var path  = require('path');

let loadWithMocks = (targetModulePath, mocks) => {
  var modulePath  = require.resolve(targetModulePath);

  delete require.cache[modulePath];

  let mockedPaths = [];

  for (var [dependencyPath, mockExports] of Object.entries(mocks)) {
    let resolvedDependencyPath  = require.resolve(path.resolve(path.dirname(modulePath), dependencyPath));
    mockedPaths.push(resolvedDependencyPath);
    require.cache[resolvedDependencyPath] = {
      id: resolvedDependencyPath,
      filename: resolvedDependencyPath,
      loaded: true,
      exports: mockExports
    };
  }

  var loadedModule  = require(modulePath);

  delete require.cache[modulePath];
  for (let mockedPath of mockedPaths) {
    delete require.cache[mockedPath];
  }

  return loadedModule;
};

module.exports = { loadWithMocks };
