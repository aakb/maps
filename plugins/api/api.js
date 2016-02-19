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
  });

  /**
   *
   */
  app.get('/api/layer/:layerid', function (req, res) {

    layers.load('objectid', Number(req.params.layerid)).then(function (data) {
      res.send(data.layer);

    }, function error(err) {
      res.status(500).send(err);
    });


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
