/**
 * @file
 * Define the default configuration.
 */
angular.module('MapsAppConfig', []).constant('CONFIG', {
  'default': {
    'style': {
      color: '#000',
      fillColor: 'rgba(19, 125, 0, 0.5)',
      weight: 1.3,
      dashArray: '',
      opacity: 1.0,
      fillOpacity: 1.0
    },
    'highlightStyle': {
      weight: 2,
      color: '#000',
      dashArray: '',
      fillColor: 'rgba(19, 125, 0, 0.2)',
      fillOpacity: 1.0
    }
  }
});