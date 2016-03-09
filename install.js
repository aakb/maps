#!/usr/bin/env node

/**
 * @file
 * This application is used to load data layers and should only be executed once
 * to initialize the application.
 */

var path = require('path');
var architect = require("architect");

// Load config file.
var configs = require(__dirname + '/config.json');

// Configure the plugins.
var config = [
  {
    "packagePath": "./plugins/layers"
  }
];

var Q = require('q');
var colors = require('colors');

function loadGeoJson(metadata, path, layers) {

  var deferred = Q.defer();

  var jf = require('jsonfile');
  var fs = require('fs');

  jf.readFile(path + "/" + metadata.file, function(err, json) {
    if (err) {
      console.log(colors.underline.red(err));
    }
    else {
      var layer = {
        "id": metadata.id,
        "name": metadata.name,
        "fields": metadata.fields,
        "geojson": json
      };
      layers.add(layer).then(function (layer) {
        console.log(colors.green('Layer "') + layer.name + colors.green('" was added with id ') + layer.id);
        deferred.resolve();
      }, function (err) {
        console.log(colors.underline.red(err));
        deferred.reject();
      });
    }
  });

  return deferred.promise;
}

// User the configuration to start the application.
config = architect.resolveConfig(config, __dirname);
architect.createApp(config, function (err, app) {
  if (err) {
    throw err;
  }

  // Check if "denmark" layer with id 1 exists.
  var layers = app.services.layers;
  layers.load('objectid', 1).then(function (data) {
    if (data.layer != null) {
      console.log('Layers already exists in the storage, so aborting the process.'.underline.red);
      process.exit(1);
    }

    var path = __dirname + '/data/layers';
    var metadata = require(path + '/layers.json');

    var loaders = [];
    for (var i = 0; i < metadata.length; i++) {
      loaders.push(loadGeoJson(metadata[i], path, layers));
    }

    Q.all(loaders).then(function () {
      console.log('All layers have been loaded'.green);
      process.exit();
    });
  }, function error(err) {
    throw new Error(err);
  });
});
