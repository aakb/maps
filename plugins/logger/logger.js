/**
 * @file
 * This is a wrapper class to handel the system logger.
 */

// Node core modules.
var fs = require('fs');
var path = require('path');

// NPM modules.
var winston = require('winston');

/**
 * Define the Base object (constructor).
 */
var Logger = function Logger(logs) {
  "use strict";

  var levels = winston.config.syslog.levels;
  winston.setLevels(levels);

  if (logs.hasOwnProperty('info')) {
    this.infoLog = new (winston.Logger)({
      levels: levels,
      transports: [
        new (winston.transports.DailyRotateFile)({
          name: 'info-file',
          filename: path.join(__dirname, '../../' + logs.info),
          level: 'info',
          datePattern: '.dd-MM-yyTHH',
          colorize: false
        })
      ],
      exitOnError: false
    });
  }

  if (logs.hasOwnProperty('debug')) {
    this.debugLog = new (winston.Logger)({
      levels: levels,
      transports: [
        new (winston.transports.DailyRotateFile)({
          name: 'debug-file',
          filename: path.join(__dirname, '../../' + logs.debug),
          level: 'debug',
          datePattern: '.dd-MM-yyTHH',
          colorize: false
        })
      ],
      exitOnError: false
    });
  }

  if (logs.hasOwnProperty('error')) {
    this.errorLog = new (winston.Logger)({
      levels: levels,
      transports: [
        new (winston.transports.DailyRotateFile)({
          name: 'error-file',
          filename: path.join(__dirname, '../../' + logs.error),
          level: 'error',
          datePattern: '.dd-MM-yyTHH',
          colorize: false
        })
      ],
      exitOnError: false
    });
  }

  if (logs.hasOwnProperty('exception')) {
    this.excepLog = new (winston.Logger)({
      levels: levels,
      transports: [
        new (winston.transports.DailyRotateFile)({
          name: 'exceptions-file',
          filename: path.join(__dirname, '../../' + logs.exception),
          datePattern: '.dd-MM-yyTHH',
          handleExceptions: true,
          humanReadableUnhandledException: true
        })
      ],
      exitOnError: true
    });
  }
};

/**
 * Log error message.
 *
 * @param message
 *   The message to send to the logger.
 */
Logger.prototype.error = function error(message) {
  "use strict";

  if (this.errorLog !== undefined) {
    this.errorLog.error(message);
  }
};

/**
 * Log info message.
 *
 * @param message
 *   The message to send to the logger.
 */
Logger.prototype.info = function info(message) {
  "use strict";

  if (this.infoLog !== undefined) {
    this.infoLog.info(message);
  }
};

/**
 * Log debug message.
 *
 * @param message
 *   The message to send to the logger.
 */
Logger.prototype.debug = function debug(message) {
  "use strict";

  if (this.debugLog !== undefined) {
    this.debugLog.debug(message);
  }
};

/**
 * Log socket message.
 *
 * @param message
 *   The message to send to the logger.
 */
Logger.prototype.socket = function socket(message, data) {
  "use strict";

  if (this.socketLog !== undefined) {
    if (data !== undefined) {
      this.socketLog.log('socket', message + ' <-:-> ', JSON.stringify(data));
    }
    else {
      this.socketLog.log('socket', message);
    }
  }
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  var logger = new Logger(options.logs);

  // Register the plugin with the system.
  register(null, {
    "logger": logger
  });
};
