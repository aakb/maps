/**
 * @file
 * Service to communication between search box and search result applications.
 */

angular.module('MapsApp').service('geoJsonService', ['$q',
  function ($q) {
    'use strict';

    /**
     * Get GeoJSON for a given layer.
     *
     * @param id
     *   The id of the layer to load.
     *
     * @returns {*|promise}
     *   Promise that is resolved when the layer is loaded.
     */
    this.getLayer = function getLayer(id) {
      var deferred = $q.defer();

      $.getJSON("/api/layer/" + id, function(data) {
        deferred.resolve(data);
      });

      return deferred.promise;
    };

    /**
     * Get metadata about all layers.
     *
     * @returns {*|promise}
     *   Promise that is resolved when data have been loaded.
     */
    this.getMetadata = function getMetadata() {
      var deferred = $q.defer();

      $.getJSON("/api/layers/metadata", function(data) {
        deferred.resolve(data);
      });

      return deferred.promise;
    };

    /**
     * Get metadata for a single layers.
     *
     * @param id
     *   The id of the layer.
     *
     * @returns {*|promise}
     *   Promise that is resolved when data have been loaded.
     */
    this.getLayerMetadata = function getLayerMetadata(id) {
      var deferred = $q.defer();

      var cache = [];

      if (cache[id] == undefined) {
        $.getJSON("/api/layers/metadata/" + id, function(data) {
          cache[id] = angular.copy(data);
          deferred.resolve(data);
        });
      }
      else {
        deferred.resolve(angular.copy(cache[id]));
      }

      return deferred.promise;
    };
  }
]);