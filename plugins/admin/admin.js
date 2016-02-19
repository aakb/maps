/**
 * @file
 * Added API to the administration interface.
 */

/**
 * This object encapsulate the RESET API.
 *
 * @param options
 * @param app
 * @param logger
 * @param search
 * @param apikeys
 *
 * @constructor
 */
var Admin = function Admin(options, app, logger) {
  "use strict";

  var self = this;
  this.logger = logger;

};

/**
 * Validate that the role is admin.
 *
 * @param req
 *   Express request object.
 */
Admin.prototype.validateCall = function validateCall(req) {
  "use strict";

  return (req.hasOwnProperty('user')) && (req.user.role === 'admin');
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  // Create the API routes using the API object.
  var admin = new Admin(options, imports.app, imports.logger);

  // This plugin extends the server plugin and do not provide new services.
  register(null, null);
};
