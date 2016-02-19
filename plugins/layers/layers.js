/**
 * @file
 * This plugin provides storage for geodata and data-sets.
 */

// Node core modules.

// NPM modules.
var Q = require('q');
var schema = require('mongoose-geojson-schema');
var mongoose = require('mongoose');

/**
 * Define the Base object (constructor).
 */
var Layers = function Layers(options) {
  "use strict";

  // Connect to the database.
  mongoose.connect('mongodb://localhost/MapLayers');

  // Define the schema and compile it into a model.
  var featureCollectionSchema = new mongoose.Schema(schema.FeatureCollection);
  this.FeatureCollection = mongoose.model('FeatureCollection', featureCollectionSchema);

  // Values to filter out for loaded layers.
  this.exclude = {
    "_id": 0,
    "__v": 0,
    "features._id": 0
  };
};

/**
 * Create new layer in the database.
 *
 * @param data
 *   GeoJSON FeatureCollection.
 */
Layers.prototype.add = function add(data) {
  "use strict";

  var deferred = Q.defer();

  var layer = new this.FeatureCollection(data);
  layer.save(function(err, layer) {
    if (err) {
      deferred.reject(err);
    }

    deferred.resolve(layer);
  });

  return deferred.promise;
};

/**
 * Load layer based on GeoJSON property.
 *
 * @param field
 *   The property field to search.
 * @param value
 *   The value for that field.
 *
 * @returns {*|promise}
 */
Layers.prototype.load = function load(field, value) {
  "use strict";

  var query = {};
  query["features.properties." + field] = value;

  return this.search(query);
};

/**
 * Search after an layer.
 *
 * @param searchQuery
 *   Search query object.
 *
 * @returns {*|promise}
 */
Layers.prototype.search = function search(searchQuery) {
  "use strict";

  var self = this;
  var deferred = Q.defer();

  self.FeatureCollection.findOne(searchQuery, self.exclude, function(err, layer) {
    if (err) {
      deferred.reject(err);
    }

    deferred.resolve({'layer': layer});
  });

  return deferred.promise;
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  var layers = new Layers(options);

  // Register the plugin with the system.
  register(null, {
    "layers": layers
  });
};
