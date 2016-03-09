/**
 * @file
 * Define the default configuration.
 */
angular.module('MapsAppConfig', []).constant('CONFIG', {
  'default': {
    'style': {
      color: '#000',
      fillColor: '#FFF',
      weight: 1.3,
      dashArray: '',
      opacity: 1.0,
      fillOpacity: 1.0
    },
    'highlightStyle': {
      weight: 2,
      color: '#000',
      dashArray: '',
      fillColor: '#A0A000',
      fillOpacity: 0.1
    }
  }
});