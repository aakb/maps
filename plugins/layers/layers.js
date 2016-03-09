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
  var featureCollectionSchema = new mongoose.Schema( {
    "id": {
      "type": Number,
      "default": 0
    },
    "name": {
      "type": String
    },
    "fields": {
      "type": Array
    },
    "geojson": schema.FeatureCollection
  });
  this.FeatureCollection = mongoose.model('FeatureCollection', featureCollectionSchema);

  // Values to filter out for loaded layers.
  this.filter = {
    "_id": 0,
    "__v": 0,
    "geojson.features._id": 0
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
  query[field] = value;

  return this.search(query, this.filter);
};

/**
 * Search after an layer.
 *
 * @param searchQuery
 *   Search query object.
 * @param filter
 *   JSON object with properties to filter result.
 *
 * @returns {*|promise}
 */
Layers.prototype.search = function search(searchQuery, filter) {
  "use strict";

  var self = this;
  var deferred = Q.defer();

  self.FeatureCollection.find(searchQuery, filter, function(err, data) {
    if (err) {
      deferred.reject(err);
    }

    deferred.resolve(data);
  });

  return deferred.promise;
};

/**
 * Load metadata about layers availablee.
 *
 * @returns {*|promise}
 */
Layers.prototype.metadata = function metadata() {
  "use strict";

  var deferred = Q.defer();

  // Filter out geojson data, but first remove _id filter or geojson data will
  // be loaded.
  var filter = JSON.parse(JSON.stringify(this.filter));
  delete filter['geojson.features._id'];
  filter['geojson'] = 0;

  this.search({}, filter).then(function (data) {
    deferred.resolve(data);
  }, function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

/**
 * Load metadata about layers availablee.
 *
 * @returns {*|promise}
 */
Layers.prototype.metadataLayer = function metadataLayer(id) {
  "use strict";

  var deferred = Q.defer();

  // Filter out geojson data, but first remove _id filter or geojson data will
  // be loaded.
  var filter = JSON.parse(JSON.stringify(this.filter));
  delete filter['geojson.features._id'];
  filter['geojson'] = 0;

  this.search({ "id": id }, filter).then(function (data) {
    deferred.resolve(data);
  }, function (err) {
    deferred.reject(err);
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
