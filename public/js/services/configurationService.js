/**
 * @file
 * Handles the current "created" maps configuration.
 */
angular.module('MapsApp').service('configurationService', ['CONFIG',
  function (CONFIG) {
    'use strict';

    this.getDefaultLayerConfig = function getDefaultLayerConfig(type) {
      var style = CONFIG.default.style;
      switch (type) {
        case 'highlight':
          style = CONFIG.default.highlightStyle;
      }

      return style;
    }
  }
]);