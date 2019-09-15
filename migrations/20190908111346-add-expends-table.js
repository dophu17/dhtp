'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db, callback) {
  db.createTable('expends', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    user_id: 'int',
    category_expend_id: 'int',
    amount: { type: 'double', defaultValue: 0 },
    created_at: 'datetime',
    updated_at: 'datetime'
  }, callback);
};

exports.down = function (db, callback) {
  db.dropTable('expends', callback);
};

exports._meta = {
  "version": 1
};
