"use strict"

path = require 'path'

fs = require 'fs'

wrench = require "wrench"

minimatch = require "minimatch"

config = require './config'

requireModule = null

windowsDrive = /^[A-Za-z]:\\/

win32 = process.platform is 'win32'

pathSeparator = if win32 then '\\' else '/'

registration = (mimosaConfig, register) ->
  if mimosaConfig.isOptimize
    requireModule = mimosaConfig.installedModules["mimosa-require"]
    e = mimosaConfig.extensions
    register ['add','update','remove'], 'beforeOptimize', _appendFilesToInclude, [e.javascript..., e.template...]
    register ['postBuild'],             'beforeOptimize', _appendFilesToInclude

_appendFilesToInclude = (mimosaConfig, options, next) ->
  hasRunConfigs = options.runConfigs?.length > 0
  return next() unless hasRunConfigs

  hasModulesDefined = mimosaConfig.requireBuildModuleInclude.modules?.length > 0
  return next() unless hasModulesDefined

  for moduleConfig in mimosaConfig.requireBuildModuleInclude.modules
    __appendFilesToModule(moduleConfig, options)
  
  next()

__appendFilesToModule = (moduleConfig, options) ->
  options.runConfigs.forEach (runConfig) ->
    includeFolder = __determinePath moduleConfig.folder, runConfig.baseUrl

    files = wrench.readdirSyncRecursive includeFolder
    files = files.map (file) ->
      path.join includeFolder, file
    .filter (file) ->
      __filePreMatchFilter(moduleConfig, file)
    .map __normalize

    # Filter files for each pattern
    moduleConfig.patterns.forEach (pattern) ->
      base = __normalize(path.join(includeFolder, pathSeparator))
      absPattern = __normalize(path.resolve(base, pattern))
      files = files.filter (file) ->
        minimatch file, absPattern

    # Map AMD paths for includes
    files = files.map (file) ->
      __getFileAMD file, runConfig.baseUrl

    if runConfig.modules?.length > 0
      matchedModules = runConfig.modules.filter (m) -> m.name is moduleConfig.name
      if matchedModules.length > 0
        __appendToModule(moduleEntry, files) for moduleEntry in matchedModules
        return

    runConfig.modules = [] unless Array.isArray(runConfig.modules)
    moduleEntry = {name: moduleConfig.name, create: true, include: []}
    __appendToModule moduleEntry, files
    runConfig.modules.push moduleEntry

__determinePath = (thePath, relativeTo) ->
  return thePath if windowsDrive.test thePath
  return thePath if thePath.indexOf("/") is 0
  path.join relativeTo, thePath

__filePreMatchFilter = (moduleConfig, file) ->
  fs.statSync(file).isFile() and
  moduleConfig.exclude.indexOf(file) is -1 and
  not (moduleConfig.excludeRegex and file.match(moduleConfig.excludeRegex))

__getFileAMD = (file, baseUrl) ->
  # Use alias if path has been aliased
  fileAMD = requireModule.manipulatePathWithAlias file
  # Get relative url/amd path if not aliased
  fileAMD = path.relative(baseUrl, file) if fileAMD is file
  return fileAMD.split(path.sep).join("/").replace(path.extname(file), '')

__appendToModule = (moduleEntry, files) ->
  moduleEntry.include = [] unless Array.isArray(moduleEntry.include)
  moduleEntry.include = moduleEntry.include.concat files

__normalize = (filepath) -> 
  return filepath.replace(/\\/g, '/') if win32
  return filepath

module.exports =
  registration: registration
  defaults:     config.defaults
  placeholder:  config.placeholder
  validate:     config.validate