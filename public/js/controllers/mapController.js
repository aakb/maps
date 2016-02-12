/**
 * Login page.
 */
app.controller('mapController', ['$scope', 'ngOverlay',
  function ($scope, ngOverlay) {
    "use strict";

    /**
     * Open overlay with a given layers settings.
     */
    $scope.layerSettings = function layerSettings() {
      var scope = $scope.$new(true);
      scope.close = function close() {
        overlay.close();
      }

      // Open the overlay.
      var overlay = ngOverlay.open({
        template: "views/layerOverlay.html",
        scope: scope
      });
    }

    /**
     * Open overlay with embed code.
     */
    $scope.generateMap = function generateMap() {
      var scope = $scope.$new(true);
      scope.close = function close() {
        overlay.close();
      }

      // Open the overlay.
      var overlay = ngOverlay.open({
        template: "views/codeOverlay.html",
        scope: scope
      });
    }
  }
]);
