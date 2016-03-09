angular.module('MapsApp').directive('itkMapConfig', ['geoJsonService', 'configurationService', 'ngOverlay',
  function (geoJsonService, configurationService, ngOverlay) {
    "use strict";

    return {
      restrict: 'E',
      scope: {},
      link: function (scope, element, attrs) {

        var loadedLayers = [];
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

          // @TODO: Add base map options: OSM and GMAP.

          // Create json layer selector.
          var Legend = L.Control.extend({
            options: {
              position: 'topleft'
            },

            onAdd: function (map) {
              var legend = L.DomUtil.create('div', 'layer-selection', L.DomUtil.get('map'));

              // @TODO: Get this from an Angular template file. So it's will be
              //        easy to sort by id.
              var layerSelectTemplate = '<span class="layer-select-option"><input type="radio" name="layerSelect" value="{id}"> {name}</span>';
              var layerSelectCheckedTemplate = '<span class="layer-select-option"><input type="radio" name="layerSelect" value="{id}" checked> {name}</span>';

              // Add content to the layer selector.
              legend.innerHTML = '<p>Layer selection</p>';
              geoJsonService.getMetadata().then(function (data) {
                for (var i = 0; i < data.length; i++ ) {
                  var layerHTML = L.Util.template(layerSelectTemplate, data[i]);
                  if (data[i].id == 1) {
                    layerHTML = L.Util.template(layerSelectCheckedTemplate, data[i]);
                  }
                  else {
                    layerHTML = L.Util.template(layerSelectTemplate, data[i]);
                  }
                  legend.innerHTML += layerHTML
                }
              });

              L.DomEvent.addListener(legend, 'click', function(e) {
                if (e.target.name == 'layerSelect') {
                  var layerId = e.target.value;

                  // Check if layer have been loaded.
                  if (loadedLayers[layerId] == undefined) {
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
                    });

                  }
                  else {
                    // Add layer to map.
                    loadedLayers[layerId].addTo(map);

                    // Remove previous layer.
                    map.removeLayer(loadedLayers[currentLayerId]);
                    currentLayerId = layerId;
                  }
                }
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