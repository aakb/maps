angular.module('MapsApp').directive('itkMapConfig', [ '$timeout', '$templateCache', '$compile', '$q', '$http', 'geoJsonService', 'configurationService', 'ngOverlay',
  function ($timeout, $templateCache, $compile, $q, $http, geoJsonService, configurationService, ngOverlay) {
    "use strict";

    return {
      restrict: 'E',
      scope: {},
      link: function (scope, element, attrs) {

        var loadedLayers = {};
        var currentLayerId = 1;

        // Load denmark base layer.
        geoJsonService.getLayer(currentLayerId).then(function(data) {
          // Create map without the zoom controller.
          var map = L.map('map', { zoomControl:false });
          map.setView(new L.LatLng(56.1883678647531, 11.634521484374998), 7);

          // Disable map zoom.
          map.doubleClickZoom.disable();
          map.scrollWheelZoom.disable();
          map.dragging.disable();

          /**
           * Display overlay for polygon configuration.
           */
          function featureClicked(layer, feature, layerId) {
            // Check if name have been fixed.
            if (!feature.properties.hasOwnProperty('name')) {
              fixFeatureProperties(feature, layerId);
            }

            var overlayScope = scope.$new(true);

            // Get information for the clicked feature into the overlay.
            overlayScope.layer = layer;
            overlayScope.feature = feature;

            // Set default color values.
            var style = configurationService.getLayerStyle(currentLayerId, overlayScope.feature.properties.FEAT_ID, ColorTypes.DEFAULT);
            overlayScope.defaultColor = style.fillColor;
            style = configurationService.getLayerStyle(currentLayerId, overlayScope.feature.properties.FEAT_ID, ColorTypes.HIGHLIGHT);
            overlayScope.highlightColor = style.fillColor;

            /**
             * Color change callback from the color picker.
             */
            overlayScope.onColorChange = function onColorChange(field, color, type) {
              // Get current layer style
              var style = configurationService.getLayerStyle(currentLayerId, overlayScope.feature.properties.FEAT_ID, type);

              // Update it with the new field value.
              style[field] = color;

              // Store it at the service.
              configurationService.setLayerStyle(currentLayerId, overlayScope.feature.properties.FEAT_ID, style, type);

              // Update the style on-screen.
              if (type == ColorTypes.DEFAULT) {
                updateLayerStyle(overlayScope.feature, overlayScope.layer, ColorTypes.DEFAULT);
              }
            };

            /**
             * Close overlay.
             */
            overlayScope.close = function close() {
              overlay.close();
            };

            // Open the overlay.
            var overlay = ngOverlay.open({
              template: "views/featureOverlay.html",
              scope: overlayScope
            });
          }

          /**
           * Helper function to stream line feature properties.
           *
           * @param feature
           *   The feature to look at.
           */
          function fixFeatureProperties(feature, layerId) {
            geoJsonService.getLayerMetadata(layerId).then(function(data) {
              // Try to generate better name from the feature data.
              feature.properties.name = 'Unknown name';
              if (feature.properties.hasOwnProperty(data[0].fields[0].name)) {
                feature.properties.name = feature.properties[data[0].fields[0].name];
              }
            });
          }

          function updateLayerStyle(feature, layer, type) {
            var style = configurationService.getLayerStyle(currentLayerId, feature.properties.FEAT_ID, type);
            layer.setStyle(style);
          }

          /**
           * Load template file from URL.
           *
           * @param tmpl
           * @param config
           * @returns {*}
           */
          function loadTemplateUrl(tmpl, config) {
            return $http.get(tmpl, angular.extend({cache: false}, config || {})).then(function(res) {
              return res.data || '';
            });
          }

          /**
           * Load template from cache and fallback to URL.
           *
           * @param tmpl
           * @returns {*}
           */
          function loadTemplate(tmpl) {
            if (!tmpl) {
              return 'Empty template';
            }

            return $templateCache.get(tmpl) || loadTemplateUrl(tmpl, {cache: false});
          }

          // @TODO: Add base map options: OSM and GMAP.

          /**
           * Create json layer selector object.
           */
          var Legend = L.Control.extend({
            options: {
              position: 'topleft'
            },

            onAdd: function (map) {
              var legend = L.DomUtil.create('div', 'layer-selection', L.DomUtil.get('map'));
              var $legend = angular.element(legend);


              // Add content to the layer selector.
              $q.when(loadTemplate('views/layerSelection.html')).then(function (template) {
                geoJsonService.getMetadata().then(function (data) {
                  // Store the template in cache.
                  $templateCache.put('views/layerSelection.html', template);

                  // Create new scope.
                  var legendScope = scope.$new(true);
                  legendScope.layers = data;
                  legendScope.disabled = false;

                  // For now the first layer selected is layer one.
                  legendScope.selected = 1;

                  /**
                   * Layer selected handler
                   *
                   * @param layerId
                   *   The layer id of the layer that should be displayed.
                   */
                  legendScope.layerSelected = function layerSelected($event, layerId) {
                    // Prevent twice firing events when labels are wrapped
                    // around input elements.
                    if ($event.target.tagName === 'LABEL') {
                      return
                    }

                    // Don't change layer if layer is selected.
                    if (legendScope.selected === layerId) {
                      return;
                    }

                    // Update the radio buttons.
                    legendScope.selected = layerId;

                    // Check if layer have been loaded.
                    if (loadedLayers[layerId] === undefined) {

                      // Disable layer selector while loading.
                      legendScope.disabled = true;

                      geoJsonService.getLayer(layerId).then(function(data) {
                        var loadedLayer = new L.geoJson(data, {
                          onEachFeature: function (feature, layer) {
                            // Set layer style.
                            updateLayerStyle(feature, layer, 'default');

                            // Handle layer/feature events.
                            layer.on({
                              mouseover: highlightFeature,
                              mouseout: resetHighlight,
                              click: function ()  {
                                featureClicked(layer, feature, layerId);
                              }
                            })
                          }
                        });
                        loadedLayer.addTo(map);

                        // Store loaded layer.
                        loadedLayers[layerId] = loadedLayer;

                        // Remove previous layer.
                        map.removeLayer(loadedLayers[currentLayerId]);
                        currentLayerId = layerId;

                        // Re-enable the layer selector.
                        legendScope.disabled = false;
                      });
                    }
                    else {
                      // Disable the layer selector.
                      legendScope.disabled = true;

                      // Add layer to map.
                      loadedLayers[layerId].addTo(map);

                      // Remove previous layer.
                      map.removeLayer(loadedLayers[currentLayerId]);
                      currentLayerId = layerId;

                      // Re-enable the layer selector.
                      legendScope.disabled = false;
                    }
                  };


                  // Attach the angular template to the dom and render the
                  // content.
                  $legend.html(template);
                  $legend.hide();
                  $(legend).append($legend).hide();
                  $timeout(function () {
                    $compile($legend)(legendScope);
                    $legend.fadeIn();
                  });
                });
              });

              return legend;
            }
          });

          map.addControl(new Legend());

          /**
           * Highlight feature by changing style.
           *
           * @param e
           *   The event fired.
           */
          function highlightFeature(e) {
            var layer = e.target;
            updateLayerStyle(layer.feature, layer, 'highlight');

            if (!L.Browser.ie && !L.Browser.opera) {
              layer.bringToFront();
            }
          }

          /**
           * Reset layer style.
           */
          function resetHighlight(e) {
            var layer = e.target;
            updateLayerStyle(layer.feature, layer, 'default');
          }

          /**
           * Load the base layer.
           */
          var denmark = new L.geoJson(data, {
            onEachFeature: function (feature, layer) {
              // Set layer style.
              updateLayerStyle(feature, layer, 'default');

              // Handle layer/feature events.
              layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: function ()  {
                  featureClicked(layer, feature, currentLayerId);
                }
              })
            }
          });

          // Save layer reference.
          loadedLayers[currentLayerId] = denmark;

          // Add layer to the map.
          denmark.addTo(map);
        });
      }
    };
  }
]);