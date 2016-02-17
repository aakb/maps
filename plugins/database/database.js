/**
 * @file
 * This is a wrapper class to handel the system logger.
 */

// Node core modules.
var fs = require("fs");

// NPM modules.
var sqlite3 = require("sqlite3");

/**
 * Define the Base object (constructor).
 */
var Database = function Database(options) {
  "use strict";

  var file = options.path + 'database.sql3';
  var exists = fs.existsSync(file);

  // If database don't exists create the file.
  if (!exists) {
    fs.openSync(file, "w");
  }

  this.db = new sqlite3.Database(file);
  this.createTables();
};

Database.prototype.createTables = function createTables() {
  //this.db.run("CREATE TABLE Stuff (thing TEXT)");
}

Database.prototype.close = function close() {
  this.db.close();
}

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  var db = new Database(options);

  // Register the plugin with the system.
  register(null, {
    "database": db
  });
};
