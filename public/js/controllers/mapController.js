/**
 * Login page.
 */
app.controller('mapController', ['$scope', 'ngOverlay',
  function ($scope, ngOverlay) {
    "use strict";



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
