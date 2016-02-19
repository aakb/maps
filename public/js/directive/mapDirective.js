angular.module('MapsApp').directive('itkMap', [
  function () {
    "use strict";

    return {
      restrict: 'E',
      scope: {},
      link: function (scope, element, attrs) {


        $.getJSON("/api/layer/0", function(data) {

          var map = L.map('map');
          map.setView(new L.LatLng(56.1883678647531, 11.634521484374998), 7);

          map.doubleClickZoom.disable();
          map.scrollWheelZoom.disable();

          function doStyleRegion(feature) {
            return {
              color: '#000',
              fillColor: '#0fb8ad',
              weight: 1.3,
              dashArray: '',
              opacity: 1.0,
              fillOpacity: 1.0
            };

          }

          function highlightFeature(e) {
            var layer = e.target;

            layer.setStyle({
              weight: 2,
              color: '#000',
              dashArray: '',
              fillOpacity: 1.0
            });

            if (!L.Browser.ie && !L.Browser.opera) {
              layer.bringToFront();
            }

            info.update(layer.feature.properties);
          }

          function resetHighlight(e) {
            regions.resetStyle(e.target);

            info.update();
          }

          function zoomToFeature(e) {
            map.fitBounds(e.target.getBounds());
          }

          var bounds = L.latLngBounds([]);

          function onEachFeature(feature, layer) {
            layer.on({
              mouseover: highlightFeature,
              mouseout: resetHighlight,
              click: zoomToFeature
            });

            // get the bounds of an individual feature
            var layerBounds = layer.getBounds();
            // extend the bounds of the collection to fit the bounds of the new feature
            bounds.extend(layerBounds);
          }

          var regions = new L.geoJson(data, {
            style: doStyleRegion,
            onEachFeature: onEachFeature
          });

          regions.addTo(map);

          // once we've looped through all the features, zoom the map to the extent of the collection
          map.fitBounds(bounds);

          var info = L.control();

          info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update();
            return this._div;
          };

          // method that we will use to update the control based on feature properties passed
          info.update = function (props) {
            this._div.innerHTML = (props ?
            '<b>' + props.navn + '</b><br />' + props.fra
              : 'Hover over a region');
          };

          info.addTo(map);

        });

      }
    };
  }
]);