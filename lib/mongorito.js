(function() {
  var Cache, Client, Mongorito, MongoritoModel, async, inflect, memcacher, mongolian;

  mongolian = require('mongolian');

  async = require('async');

  memcacher = require('memcacher');

  inflect = require('i');

  Client = void 0;

  Cache = void 0;

  
var hasProp = Object.prototype.hasOwnProperty,
  	extendsClass = function(child, parent) {
		for (var key in parent) {
			if (hasProp.call(parent, key)) child[key] = parent[key]; 
		}
		function ctor(proto) { this.constructor = child; for(var method in proto) { this[method] = proto[method]; } }
		ctor.prototype = parent.prototype;
		child.prototype = new ctor(child.prototype);
		child.__super__ = parent.prototype;
		return child; 
	}
;

  Mongorito = (function() {

    function Mongorito() {}

    Mongorito.disconnect = function() {
      return Client.close();
    };

    Mongorito.connect = function(servers) {
      if (servers == null) servers = [];
      Client = new mongolian(servers[0]);
      return Client.log = {
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {}
      };
    };

    Mongorito.cache = function(servers) {
      if (servers == null) servers = [];
      return Cache = new memcacher(servers);
    };

    Mongorito.bake = function(model) {
      var object;
      extendsClass(model, MongoritoModel);
      object = new model;
      model.collectionName = object.collectionName;
      model.model = model;
      return model;
    };

    return Mongorito;

  })();

  MongoritoModel = (function() {

    function MongoritoModel(collectionName) {
      this.collectionName = collectionName != null ? collectionName : '';
    }

    MongoritoModel.prototype.fields = function() {
      var field, fields, notFields;
      notFields = ['constructor', 'save', 'collectionName', 'create', 'fields', 'update', 'remove', 'beforeCreate', 'aroundCreate', 'afterCreate', 'beforeUpdate', 'aroundUpdate', 'afterUpdate'];
      fields = {};
      for (field in this) {
        if (-1 === notFields.indexOf(field)) fields[field] = this[field];
      }
      return fields;
    };

    MongoritoModel.bakeModelsFromItems = function(items, _model) {
      var field, item, model, models, _i, _len;
      models = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        item._id = item._id.toString();
        model = new _model;
        model.collectionName = _model.collectionName;
        for (field in item) {
          model[field] = item[field];
        }
        models.push(model);
      }
      return models;
    };

    MongoritoModel.find = function(options, callback) {
      var key, query, that;
      if (typeof options === 'function') {
        callback = options;
        options = {};
      } else {
        if (options.callback) {
          callback = options.callback;
          delete options.callback;
        }
      }
      that = this;
      query = function(done) {
        var fields, notFields, property, request;
        fields = {};
        notFields = ['limit', 'skip', 'sort'];
        for (property in options) {
          if (options.hasOwnProperty(property) && notFields.indexOf(property) === -1) {
            fields[property] = options[property];
          }
        }
        request = Client.collection(that.collectionName).find(fields);
        if (options.limit) request = request.limit(options.limit);
        if (options.skip) request = request.skip(options.skip);
        if (options.sort) request = request.sort(options.sort);
        return request.toArray(function(err, items) {
          var item, _i, _len;
          for (_i = 0, _len = items.length; _i < _len; _i++) {
            item = items[_i];
            item._id = item._id.toString();
          }
          return done(err, items);
        });
      };
      if (!Cache) {
        return query(function(err, items) {
          var models;
          models = that.bakeModelsFromItems(items, that.model);
          return callback(err, models);
        });
      }
      key = "" + this.collectionName + "-" + (JSON.stringify(options));
      return Cache.get(key, function(err, result) {
        var models;
        if (!result) {
          return query(function(err, items) {
            return Cache.set(key, JSON.stringify(items), 86400, [that.collectionName], function() {
              var models;
              models = that.bakeModelsFromItems(items, that.model);
              return callback(err, models);
            });
          });
        } else {
          models = that.bakeModelsFromItems(JSON.parse(result), that.model);
          return callback(err, models);
        }
      });
    };

    MongoritoModel.prototype.save = function(callback) {
      var field, fields, keys, notFields, operation, that;
      that = this;
      fields = this.fields();
      operation = fields._id ? "update" : "create";
      if (operation === "update") {
        if (this['beforeUpdate']) this.beforeUpdate();
        if (this['aroundUpdate']) this.aroundUpdate();
      } else {
        if (this['beforeCreate']) this.beforeCreate();
        if (this['aroundCreate']) this.aroundCreate();
      }
      notFields = ['constructor', 'save', 'collectionName', 'create', 'fields', 'update', 'remove', 'models'];
      keys = [];
      for (field in this) {
        if (-1 === notFields.indexOf(field)) keys.push(field);
      }
      return async.filter(keys, function(key, nextKey) {
        if (that["validate" + (inflect.camelize(key))]) {
          return that["validate" + (inflect.camelize(key))](function(valid) {
            return nextKey(!valid);
          });
        } else {
          return nextKey(false);
        }
      }, function(results) {
        var performOperation;
        if (results.length > 0) return callback(true, results);
        performOperation = function() {
          return that[operation](callback, true);
        };
        if (Cache) {
          return Cache.delByTag(that.collectionName, performOperation);
        } else {
          return performOperation();
        }
      });
    };

    MongoritoModel.prototype.create = function(callback, fromSave) {
      var object, that;
      if (fromSave == null) fromSave = false;
      object = this.fields();
      that = this;
      return Client.collection(this.collectionName).insert(object, function(err, result) {
        result._id = result._id.toString();
        that._id = result._id;
        if (that['aroundCreate']) that.aroundCreate();
        if (that['afterCreate']) that.afterCreate();
        if (callback) return callback(err, result);
      });
    };

    MongoritoModel.prototype.update = function(callback, fromSave) {
      var object, that, _id;
      if (fromSave == null) fromSave = false;
      object = this.fields();
      _id = new mongolian.ObjectId(object._id);
      delete object._id;
      that = this;
      return Client.collection(this.collectionName).update({
        _id: _id
      }, object, function(err, rowsUpdated) {
        if (that['aroundUpdate']) that.aroundUpdate();
        if (that['afterUpdate']) that.afterUpdate();
        if (callback) return callback(err, rowsUpdated);
      });
    };

    MongoritoModel.prototype.remove = function(callback) {
      var object, query, that, _id;
      object = this.fields();
      _id = new mongolian.ObjectId(object._id);
      if (this['beforeRemove']) this.beforeRemove();
      if (this['aroundRemove']) this.aroundRemove();
      that = this;
      query = function() {
        return Client.collection(that.collectionName).remove({
          _id: _id
        }, function(err) {
          if (that['aroundRemove']) that.aroundRemove();
          if (that['afterRemove']) that.afterRemove();
          if (callback) return callback(err);
        });
      };
      if (Cache) {
        return Cache.delByTag(this.collectionName, query);
      } else {
        return query();
      }
    };

    return MongoritoModel;

  })();

  module.exports = {
    connect: Mongorito.connect,
    disconnect: Mongorito.disconnect,
    cache: Mongorito.cache,
    bake: Mongorito.bake,
    Model: MongoritoModel
  };

}).call(this);
