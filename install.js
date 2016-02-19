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

// User the configuration to start the application.
config = architect.resolveConfig(config, __dirname);
architect.createApp(config, function (err, app) {
  if (err) {
    throw err;
  }

  var colors = require('colors');

  // Check if "denmark" layer with id 1 exists.
  var layers = app.services.layers;
  layers.load('objectid', 1).then(function (data) {
    if (data.layer != null) {
      console.log('Layers already exists in the storage, so aborting the process.'.underline.red);
      process.exit(1);
    }

    // Layers (layer 1) not found, so lets load the GeoJSON files.
    var jf = require('jsonfile');
    var fs = require('fs');

    var path = __dirname + '/data/layers';
    fs.readdir(path, function(err, files) {
      if (err) {
        console.log(colors.underline.red(err));
        process.exit(1);
      }

      // @TODO: Re-do this with promises, so the process can be exited when
      //        completed.
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (file.indexOf('.geojson') > 0){
          jf.readFile(path + "/" + file, function(err, json) {
            if (err) {
              console.log(colors.underline.red(err));
            }
            else {
              var layer = {
                "name": 'Unknown',
                "geojson": json
              };
              layers.add(layer).then(function (layer) {
                console.log('Layer was added with id: '.green + layer.id);
              }, function (err) {
                console.log(colors.underline.red(err));
              });
            }
          });
        }
      }
    });


  }, function error(err) {
    throw new Error(err);
  });
});
