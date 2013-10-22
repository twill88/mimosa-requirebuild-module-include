"use strict"

exports.defaults = ->
  requireBuildModuleInclude:
    folder: ""
    patterns: []
    exclude: [/-built.js$/,/reload-client.js$/]
    modules: [{
      name: "main"
    }]

exports.placeholder = ->
  """
  \t

    # requireBuildModuleInclude:
      # folder: ""                       # A subdirectory of the javascriptDir that is scanned
                                         # for files to include.
      # patterns: []                     # Patterns used to match files for inclusion.
      # exclude: []                      # A list of regexes or strings used to prevent the
                                         # inclusion of matching files.
      # modules: [{                      # Specify modules to add the files to the r.js includes
                                         # array. This should ideally be used in conjunction with
                                         # r.js modules.
      #   name: ""                       # Name of the module in which to include the files. If
                                         # the name matches that of a module specified in the
                                         # r.js config, it will add the files to the include for
                                         # that module. If the name doesn't match a r.js module,
                                         # a new module will be created with this name.
      #   folder: ""                     # A subdirectory of the javascriptDir used for this
                                         # specific module. If not specified, uses the folder
                                         # specified above. Must be specified here or above.
      #   patterns: []                   # Patterns used to match files for this specific module.
                                         # If none are specified, uses the patterns specified
                                         # above. Must be specified here or above.
      #   exclude: []                    # A list of regexes or strings used to prevent inclusion
      # }]                               # matching files in this specific module. If none are
                                         # specified, uses the exclude array specified above.

  """

exports.validate = (config, validators) ->
  errors = []
  if validators.ifExistsIsObject(errors, "requireBuildModuleInclude config", config.requireBuildModuleInclude)
    validators.ifExistsIsString(errors, "requireBuildModuleInclude.folder", config.requireBuildModuleInclude.folder)
    validators.ifExistsIsArrayOfStrings(errors, "requireBuildModuleInclude.patterns", config.requireBuildModuleInclude.patterns)
    validators.ifExistsFileExcludeWithRegexAndString(errors, "requireBuildModuleInclude.exclude", config.requireBuildModuleInclude, config.watch.compiledDir)
    if validators.isArrayOfObjects(errors, "requireBuildModuleInclude.modules", config.requireBuildModuleInclude.modules)
      for moduleConfig in config.requireBuildModuleInclude.modules
        validators.stringMustExist(errors, "requireBuildModuleInclude.modules.name", moduleConfig.name)
        unless validators.ifExistsIsString(errors, "requireBuildModuleInclude.modules.folder", moduleConfig.folder)
          if validators.isString(errors, "requireBuildModuleInclude.folder", config.requireBuildModuleInclude.folder)
            moduleConfig.folder = config.requireBuildModuleInclude.folder
        unless validators.ifExistsIsArrayOfStrings(errors, "requireBuildModuleInclude.modules.patterns", moduleConfig.patterns)
          if validators.isArrayOfStringsMustExist(errors, "requireBuildModuleInclude.patterns", config.requireBuildModuleInclude.patterns)
            moduleConfig.patterns = config.requireBuildModuleInclude.patterns
        unless validators.ifExistsFileExcludeWithRegexAndString(errors, "requireBuildModuleInclude.modules.exclude", moduleConfig, config.watch.compiledDir)
          if validators.ifExistsFileExcludeWithRegexAndString(errors, "requireBuildModuleInclude.exclude", config.requireBuildModuleInclude, config.watch.compiledDir)
            moduleConfig.exclude = config.requireBuildModuleInclude.exclude

  errors
