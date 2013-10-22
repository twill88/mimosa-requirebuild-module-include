"use strict";
exports.defaults = function() {
  return {
    requireBuildModuleInclude: {
      folder: "",
      patterns: [],
      exclude: [/-built.js$/, /reload-client.js$/],
      modules: [
        {
          name: "main"
        }
      ]
    }
  };
};

exports.placeholder = function() {
  return "\t\n\n  # requireBuildModuleInclude:\n    # folder: \"\"                       # A subdirectory of the javascriptDir that is scanned\n                                       # for files to include.\n    # patterns: []                     # Patterns used to match files for inclusion.\n    # exclude: []                      # A list of regexes or strings used to prevent the\n                                       # inclusion of matching files.\n    # modules: [{                      # Specify modules to add the files to the r.js includes\n                                       # array. This should ideally be used in conjunction with\n                                       # r.js modules.\n    #   name: \"\"                       # Name of the module in which to include the files. If\n                                       # the name matches that of a module specified in the\n                                       # r.js config, it will add the files to the include for\n                                       # that module. If the name doesn't match a r.js module,\n                                       # a new module will be created with this name.\n    #   folder: \"\"                     # A subdirectory of the javascriptDir used for this\n                                       # specific module. If not specified, uses the folder\n                                       # specified above. Must be specified here or above.\n    #   patterns: []                   # Patterns used to match files for this specific module.\n                                       # If none are specified, uses the patterns specified\n                                       # above. Must be specified here or above.\n    #   exclude: []                    # A list of regexes or strings used to prevent inclusion\n    # }]                               # matching files in this specific module. If none are\n                                       # specified, uses the exclude array specified above.\n";
};

exports.validate = function(config, validators) {
  var errors, moduleConfig, _i, _len, _ref;
  errors = [];
  if (validators.ifExistsIsObject(errors, "requireBuildModuleInclude config", config.requireBuildModuleInclude)) {
    validators.ifExistsIsString(errors, "requireBuildModuleInclude.folder", config.requireBuildModuleInclude.folder);
    validators.ifExistsIsArrayOfStrings(errors, "requireBuildModuleInclude.patterns", config.requireBuildModuleInclude.patterns);
    validators.ifExistsFileExcludeWithRegexAndString(errors, "requireBuildModuleInclude.exclude", config.requireBuildModuleInclude, config.watch.compiledDir);
    if (validators.isArrayOfObjects(errors, "requireBuildModuleInclude.modules", config.requireBuildModuleInclude.modules)) {
      _ref = config.requireBuildModuleInclude.modules;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        moduleConfig = _ref[_i];
        validators.stringMustExist(errors, "requireBuildModuleInclude.modules.name", moduleConfig.name);
        if (!validators.ifExistsIsString(errors, "requireBuildModuleInclude.modules.folder", moduleConfig.folder)) {
          if (validators.isString(errors, "requireBuildModuleInclude.folder", config.requireBuildModuleInclude.folder)) {
            moduleConfig.folder = config.requireBuildModuleInclude.folder;
          }
        }
        if (!validators.ifExistsIsArrayOfStrings(errors, "requireBuildModuleInclude.modules.patterns", moduleConfig.patterns)) {
          if (validators.isArrayOfStringsMustExist(errors, "requireBuildModuleInclude.patterns", config.requireBuildModuleInclude.patterns)) {
            moduleConfig.patterns = config.requireBuildModuleInclude.patterns;
          }
        }
        if (!validators.ifExistsFileExcludeWithRegexAndString(errors, "requireBuildModuleInclude.modules.exclude", moduleConfig, config.watch.compiledDir)) {
          if (validators.ifExistsFileExcludeWithRegexAndString(errors, "requireBuildModuleInclude.exclude", config.requireBuildModuleInclude, config.watch.compiledDir)) {
            moduleConfig.exclude = config.requireBuildModuleInclude.exclude;
          }
        }
      }
    }
  }
  return errors;
};
