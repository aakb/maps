/**
* @file
* Defines the Angular JS application the run the administration frontend.
*/

// Define the angular application.
var app = angular.module('MapsApp', [ 'ngRoute', 'ngOverlay', 'appMessage' ]);

/**
 * Add authentication header to all AJAX requests.
 */
app.factory('authInterceptor', ['$rootScope', '$q', '$window', '$location',
  function ($rootScope, $q, $window, $location) {
    "use strict";

    return {
      request: function (config) {
        config.headers = config.headers || {};
        if ($window.sessionStorage.token) {
          config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
        }
        return config;
      },
      responseError: function (response) {
        if (response.status === 401) {
          // Handle auth error by redirect to front page.
          $location.path('');
        }
        return response || $q.when(response);
      }
    };
  }
]);

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
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'frontpageController'
      });

    $httpProvider.interceptors.push('authInterceptor');
	}
]);
