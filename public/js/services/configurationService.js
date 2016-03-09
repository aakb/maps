/**
 * @file
 * Handles the current "created" maps configuration.
 */
angular.module('MapsApp').service('configurationService', ['CONFIG',
  function (CONFIG) {
    'use strict';

    // Empty configuration settings.
    var configuration = {
      "style": {

      }
    };

    /**
     * Get layer/feature configuration.
     *
     * @param layerId
     *   The layers id.
     * @param featureId
     *   Id of the feature in the layer.
     * @param type
     *   The type of configuration to fetch.
     *
     * @returns {*}
     *   The layer/feature style.
     */
    this.getLayerStyle = function getLayerStyle(layerId, featureId, type) {
      var style = angular.copy(CONFIG.default.style);

      if (configuration.style.hasOwnProperty(layerId)) {
        if (configuration.style[layerId].hasOwnProperty(featureId)) {
          if (configuration.style[layerId][featureId].hasOwnProperty(type)) {
            return configuration.style[layerId][featureId][type];
          }
        }
      }

      switch (type) {
        case ColorTypes.HIGHLIGHT:
          style = angular.copy(CONFIG.default.highlightStyle);
      }

      return style;
    };

    /**
     * Set/update configuration.
     *
     * @param layerId
     *   The layers id.
     * @param featureId
     *   Id of the feature in the layer.
     * @param style
     *   The style to store.
     * @param type
     *   The type of configuration to fetch.
     */
    this.setLayerStyle = function setLayerStyle(layerId, featureId, style, type) {
      if (!configuration.style.hasOwnProperty(layerId)) {
        configuration.style[layerId] = {}
      }

      if (!configuration.style[layerId].hasOwnProperty(featureId)) {
        configuration.style[layerId][featureId] = {}
      }

      configuration.style[layerId][featureId][type] = style;
    };
  }
]);