/**
 * @file
 * Service to communication between search box and search result applications.
 */

angular.module('MapsApp').service('geoJsonService', ['$q',
  function ($q) {
    'use strict';

    this.getLayer = function getLayer(id) {
      var deferred = $q.defer();

      $.getJSON("/api/layer/" + id, function(data) {
        deferred.resolve(data);
      });

      return deferred.promise;
    };

    this.getMetadata = function getMetadata() {
      var deferred = $q.defer();

      $.getJSON("/api/layers/metadata", function(data) {
        deferred.resolve(data);
      });

      return deferred.promise;
    }
  }
]);