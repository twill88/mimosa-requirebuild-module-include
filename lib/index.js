"use strict";
var config, fs, minimatch, path, pathSeparator, registration, requireModule, win32, windowsDrive, wrench, __appendFilesToModule, __appendToModule, __determinePath, __filePreMatchFilter, __getFileAMD, __normalize, _appendFilesToInclude,
  __slice = [].slice;

path = require('path');

fs = require('fs');

wrench = require("wrench");

minimatch = require("minimatch");

config = require('./config');

requireModule = null;

windowsDrive = /^[A-Za-z]:\\/;

win32 = process.platform === 'win32';

pathSeparator = win32 ? '\\' : '/';

registration = function(mimosaConfig, register) {
  var e;
  if (mimosaConfig.isOptimize) {
    requireModule = mimosaConfig.installedModules["mimosa-require"];
    e = mimosaConfig.extensions;
    register(['add', 'update', 'remove'], 'beforeOptimize', _appendFilesToInclude, __slice.call(e.javascript).concat(__slice.call(e.template)));
    return register(['postBuild'], 'beforeOptimize', _appendFilesToInclude);
  }
};

_appendFilesToInclude = function(mimosaConfig, options, next) {
  var hasModulesDefined, hasRunConfigs, moduleConfig, _i, _len, _ref, _ref1, _ref2;
  hasRunConfigs = ((_ref = options.runConfigs) != null ? _ref.length : void 0) > 0;
  if (!hasRunConfigs) {
    return next();
  }
  hasModulesDefined = ((_ref1 = mimosaConfig.requireBuildModuleInclude.modules) != null ? _ref1.length : void 0) > 0;
  if (!hasModulesDefined) {
    return next();
  }
  _ref2 = mimosaConfig.requireBuildModuleInclude.modules;
  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
    moduleConfig = _ref2[_i];
    __appendFilesToModule(moduleConfig, options);
  }
  return next();
};

__appendFilesToModule = function(moduleConfig, options) {
  return options.runConfigs.forEach(function(runConfig) {
    var files, includeFolder, matchedModules, moduleEntry, _i, _len, _ref;
    includeFolder = __determinePath(moduleConfig.folder, runConfig.baseUrl);
    files = wrench.readdirSyncRecursive(includeFolder);
    files = files.map(function(file) {
      return path.join(includeFolder, file);
    }).filter(function(file) {
      return __filePreMatchFilter(moduleConfig, file);
    }).map(__normalize);
    moduleConfig.patterns.forEach(function(pattern) {
      var absPattern, base;
      base = __normalize(path.join(includeFolder, pathSeparator));
      absPattern = __normalize(path.resolve(base, pattern));
      return files = files.filter(function(file) {
        return minimatch(file, absPattern);
      });
    });
    files = files.map(function(file) {
      return __getFileAMD(file, runConfig.baseUrl);
    });
    if (((_ref = runConfig.modules) != null ? _ref.length : void 0) > 0) {
      matchedModules = runConfig.modules.filter(function(m) {
        return m.name === moduleConfig.name;
      });
      if (matchedModules.length > 0) {
        for (_i = 0, _len = matchedModules.length; _i < _len; _i++) {
          moduleEntry = matchedModules[_i];
          __appendToModule(moduleEntry, files);
        }
        return;
      }
    }
    if (!Array.isArray(runConfig.modules)) {
      runConfig.modules = [];
    }
    moduleEntry = {
      name: moduleConfig.name,
      create: true,
      include: []
    };
    __appendToModule(moduleEntry, files);
    return runConfig.modules.push(moduleEntry);
  });
};

__determinePath = function(thePath, relativeTo) {
  if (windowsDrive.test(thePath)) {
    return thePath;
  }
  if (thePath.indexOf("/") === 0) {
    return thePath;
  }
  return path.join(relativeTo, thePath);
};

__filePreMatchFilter = function(moduleConfig, file) {
  return fs.statSync(file).isFile() && moduleConfig.exclude.indexOf(file) === -1 && !(moduleConfig.excludeRegex && file.match(moduleConfig.excludeRegex));
};

__getFileAMD = function(file, baseUrl) {
  var fileAMD;
  fileAMD = requireModule.manipulatePathWithAlias(file);
  if (fileAMD === file) {
    fileAMD = path.relative(baseUrl, file);
  }
  return fileAMD.split(path.sep).join("/").replace(path.extname(file), '');
};

__appendToModule = function(moduleEntry, files) {
  if (!Array.isArray(moduleEntry.include)) {
    moduleEntry.include = [];
  }
  return moduleEntry.include = moduleEntry.include.concat(files);
};

__normalize = function(filepath) {
  if (win32) {
    return filepath.replace(/\\/g, '/');
  }
  return filepath;
};

module.exports = {
  registration: registration,
  defaults: config.defaults,
  placeholder: config.placeholder,
  validate: config.validate
};
