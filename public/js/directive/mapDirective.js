angular.module('MapsApp').directive('itkMap', ['geoJsonService',
  function (geoJsonService) {
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
           * Highlight feature by changing style.
           */
          function highlightFeature(e) {
            var layer = e.target;

            layer.setStyle({
              weight: 2,
              color: '#000',
              dashArray: '',
              fillColor: '#A0A0A0',
              fillOpacity: 0.1
            });

            if (!L.Browser.ie && !L.Browser.opera) {
              layer.bringToFront();
            }
          }

          // Create json layer selector.
          var Legend = L.Control.extend({
            options: {
              position: 'topleft'
            },

            onAdd: function (map) {
              var legend = L.DomUtil.create('div', 'layer-selection', L.DomUtil.get('map'));

              var layerSelectTemplate = '<span class="layer-select-option"><input type="radio" name="layerSelect" value="{id}"> {name}</span>';
              var layerSelectCheckedTemplate = '<span class="layer-select-option"><input type="radio" name="layerSelect" value="{id}" checked> {name}</span>';

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
                        style: function () {
                          return {
                            color: '#000',
                            fillColor: '#FFF',
                            weight: 1.3,
                            dashArray: '',
                            opacity: 1.0,
                            fillOpacity: 1.0
                          }
                        },
                        onEachFeature: function (feature, layer) {
                          layer.on({
                            mouseover: highlightFeature,
                            mouseout: resetHighlight,
                            click: function() {
                              alert('click');
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
           * Reset layer style.
           */
          function resetHighlight(e) {
            denmark.resetStyle(e.target);
          }

          /**
           * Load the base layer.
           */
          var denmark = new L.geoJson(data, {
            style: function () {
              return {
                color: '#000',
                fillColor: '#FFF',
                weight: 1.3,
                dashArray: '',
                opacity: 1.0,
                fillOpacity: 1.0
              }
            },
            onEachFeature: function (feature, layer) {
              layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: function() {
                  alert('click');
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