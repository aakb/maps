/**
 * @file
 * Added API to send content into the search engine
 */

// Node core modules.
var path = require('path');

// NPM modules.
var Q = require('q');

/**
 * This object encapsulate the RESET API.
 *
 * @param app
 * @param logger
 * @param layers
 * @param options
 *
 * @constructor
 */
var API = function (app, logger, layers, options) {
  "use strict";

  var self = this;
  this.logger = logger;

  /**
   * Default get request.
   */
  app.get('/api', function (req, res) {
    res.send('Please see documentation about using this api.');
    res.end();
  });

  /**
   * Layer based on object id property.
   */
  app.get('/api/layer/:id', function (req, res) {
    layers.load('id', Number(req.params.id)).then(function (data) {
      res.append('Content-Type','application/json');
      res.append('Cache-Control','public, max-age=1209600');
      res.json(data[0].geojson);
      res.end();
    }, function error(err) {
      res.status(500).send(err);
      res.end();
    });
  });

  /**
   * Metadata about all layers.
   */
  app.get('/api/layers/metadata', function (req, res) {
    layers.metadata().then(function (data) {
      res.append('Content-Type','application/json');
      res.append('Cache-Control','public, max-age=1209600');
      res.json(data);
      res.end();
    }, function error(err) {
      res.status(500).send(err);
      res.end();
    });
  });

  /**
   * Load maps configuration.
   */
  app.get('api/map/:id', function (req, res) {

  });

  /**
   * Save maps configuration.
   */
  app.post('api/map', function (req, res) {

  });
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  // Create the API routes using the API object.
  var api = new API(imports.app, imports.logger, imports.layers, options);

  // This plugin extends the server plugin and do not provide new services.
  register(null, null);
};
