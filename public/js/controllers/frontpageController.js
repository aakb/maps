/**
 * Frontpage page.
 */
angular.module('MapsApp').controller('frontpageController', ['$scope', '$location',
  function ($scope, $location) {
    "use strict";

    $scope.user = {
      'mail': '',
      'name': 'Tester',
      'pass': ''
    };

    /**
     * Create new map click handler.
     */
    $scope.createClick = function createClick() {
      $location.path('map');
    };
  }
]);
