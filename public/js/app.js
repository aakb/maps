/**
* @file
* Defines the Angular JS application the run the administration frontend.
*/

// Define the angular application.
var app = angular.module('MapsApp', [ 'ngRoute', 'ngOverlay', 'MapsAppConfig' ]);

/**
 * Configure routes and add auth interceptor.
 */
app.config(['$routeProvider', '$locationProvider', '$httpProvider',
  function ($routeProvider, $locationProvider, $httpProvider) {
    "use strict";

    $routeProvider
      .when('/', {
        templateUrl: 'views/frontpage.html',
        controller: 'frontpageController'
      })
      .when('/map', {
        templateUrl: 'views/map.html',
        controller: 'mapController'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'loginController'
      })
      .when('/logout', {
        templateUrl: 'views/logout.html',
        controller: 'logoutController'
      });

	}
]);
