var Client, GenericModel, Mongorito, MongoritoModel, async, mongolian,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

mongolian = require('mongolian');

async = require('async');

Client = void 0;

String.prototype.plural = function() {
	var s = this.trim().toLowerCase();
	end = s.substr(-1);
	if(end == 'y') {
		var vowels = ['a', 'e', 'i', 'o', 'u'];
		s = s.substr(-2, 1) in vowels ? s + 's' : s.substr(0, s.length-1) + 'ies';
	} else if(end == 'h') {
    	s += s.substr(-2) == 'ch' || s.substr(-2) == 'sh' ? 'es' : 's';
	} else if(end == 's') {
		s += 'es';
	} else {
		s += 's';
	}
	return s;
}

String.prototype.singular = function() {
	var s = this.trim().toLowerCase();
	var end = s.substr(-3);
	if(end == 'ies') {
		s = s.substr(0, s.length-3) + 'y';
	} else if(end == 'ses') {
		s = s.substr(0, s.length-2);
	} else {
		end = s.substr(-1);
		if(end == 's') {
			s = s.substr(0, s.length-1);
		}
	}
	return s;
}

String.prototype.camelize = function() {
	var s = 'x_' + this.trim().toLowerCase();
	s = s.replace(/[\s_]/g, ' ');
	s = s.replace(/^(.)|\s(.)/g, function($1) {
		return $1.toUpperCase();
	});
	return s.replace(/ /g, '').substr(1);
}

String.prototype.underscore = function() {
	return this.trim().toLowerCase().replace(/[\s]+/g, '_');
}

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

  Mongorito.connect = function(database, servers, username, password) {
    var server;
    if (database == null) database = '';
    if (servers == null) servers = [];
    if (username == null) username = '';
    if (password == null) password = '';
    if (servers.length === 1) {
      server = new mongolian(servers[0]);
      Client = server.db(database);
      Client.log = {
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {}
      };
      if (username) return Client.auth(username, password);
    } else {
      server = new mongolian(servers[0]);
      Client = server.db(database);
      Client.log = {
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {}
      };
      if (username) return Client.auth(username, password);
    }
  };

  Mongorito.bake = function(model) {
    var object;
    extendsClass(model, MongoritoModel);
    object = new model;
    model.collection = object.collection;
    model.model = model;
    return model;
  };

  return Mongorito;

})();

MongoritoModel = (function() {

  function MongoritoModel(collection) {
    this.collection = collection != null ? collection : '';
  }

  MongoritoModel.prototype.fields = function() {
    var field, fields, notFields;
    notFields = ['constructor', 'save', 'collection', 'create', 'fields', 'update', 'remove', 'beforeCreate', 'aroundCreate', 'afterCreate', 'beforeUpdate', 'aroundUpdate', 'afterUpdate'];
    fields = {};
    for (field in this) {
      if (-1 === notFields.indexOf(field)) fields[field] = this[field];
    }
    return fields;
  };

  MongoritoModel.findById = function(id, callback) {
    var that;
    that = this;
    return Client.collection(this.collection).find({
      _id: new mongolian.ObjectId(id.toString())
    }).toArray(function(err, item) {
      var field, model;
      if (item.length === 0) {
        item = item[0];
        item._id = item._id.toString();
        model = new that.model;
        model.collection = that.collection;
        for (field in item) {
          model[field] = item[field];
        }
      } else {
        model = false;
      }
      return process.nextTick(function() {
        return callback(err, model);
      });
    });
  };

  MongoritoModel.findWithOrderAndLimit = function(criteria, order, limit, skip, callback) {
    var that;
    if (typeof criteria === 'object') {
      if (typeof order === 'number') {
        if (typeof limit === 'function') {
          callback = limit;
          limit = order;
          order = criteria;
          criteria = {};
        }
        if (typeof limit === 'number') {
          if (typeof skip === 'function') {
            callback = skip;
            skip = limit;
            limit = order;
            order = criteria;
            criteria = {};
          }
        }
      }
    }
    if (!skip) skip = 0;
    that = this;
    return Client.collection(this.collection).find(criteria).sort(order).limit(limit).skip(skip).toArray(function(err, items) {
      var field, item, model, models, _i, _len;
      models = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        item._id = item._id.toString();
        model = new that.model;
        model.collection = that.collection;
        for (field in item) {
          model[field] = item[field];
        }
        models.push(model);
      }
      return process.nextTick(function() {
        return callback(err, models);
      });
    });
  };

  MongoritoModel.findWithOrder = function(criteria, order, callback) {
    var that;
    if (typeof criteria === 'object' && typeof order === 'function') {
      callback = order;
      order = criteria;
      criteria = {};
      order = {
        _id: -1
      };
    }
    that = this;
    return Client.collection(this.collection).find(criteria).sort(order).toArray(function(err, items) {
      var field, item, model, models, _i, _len;
      models = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        item._id = item._id.toString();
        model = new that.model;
        model.collection = that.collection;
        for (field in item) {
          model[field] = item[field];
        }
        models.push(model);
      }
      return process.nextTick(function() {
        return callback(err, models);
      });
    });
  };

  MongoritoModel.findWithLimit = function(criteria, limit, skip, callback) {
    var that;
    if (typeof criteria === 'number') {
      if (typeof limit === 'function') {
        callback = limit;
        limit = criteria;
        criteria = {};
      }
      if (typeof limit === 'number') {
        if (typeof skip === 'function') {
          callback = skip;
          skip = limit;
          criteria = {};
        }
      }
    } else {
      if (typeof limit === 'function') {
        callback = limit;
        limit = 10;
      }
      if (typeof skip === 'function') {
        callback = skip;
        skip = 0;
      }
    }
    that = this;
    return Client.collection(this.collection).find(criteria).limit(limit).skip(skip).toArray(function(err, items) {
      var field, item, model, models, _i, _len;
      models = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        item._id = item._id.toString();
        model = new that.model;
        model.collection = that.collection;
        for (field in item) {
          model[field] = item[field];
        }
        models.push(model);
      }
      return process.nextTick(function() {
        return callback(err, models);
      });
    });
  };

  MongoritoModel.find = function(criteria, callback) {
    var that;
    if (criteria == null) criteria = {};
    if (typeof criteria === 'function') {
      callback = criteria;
      criteria = {};
    }
    that = this;
    return Client.collection(this.collection).find(criteria).toArray(function(err, items) {
      var field, item, model, models, _i, _len;
      models = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        item._id = item._id.toString();
        model = new that.model;
        model.collection = that.collection;
        for (field in item) {
          model[field] = item[field];
        }
        models.push(model);
      }
      return process.nextTick(function() {
        return callback(err, models);
      });
    });
  };

  MongoritoModel.prototype.save = function(callback) {
    var field, fields, keys, notFields, that;
    that = this;
    fields = this.fields;
    notFields = ['constructor', 'save', 'collection', 'create', 'fields', 'update', 'remove', 'models'];
    keys = [];
    for (field in this) {
      if (-1 === notFields.indexOf(field)) keys.push(field);
    }
    return async.filter(keys, function(key, nextKey) {
      if (that["validate" + (key.camelize())]) {
        return that["validate" + (key.camelize())](function(valid) {
          return nextKey(!valid);
        });
      } else {
        return nextKey(false);
      }
    }, function(results) {
      if (results.length > 0) return callback(true, results);
      if (fields._id) {
        return that.update(callback, true);
      } else {
        return that.create(callback, true);
      }
    });
  };

  MongoritoModel.prototype.create = function(callback, fromSave) {
    var object, that;
    if (fromSave == null) fromSave = false;
    object = this.fields();
    if (this['beforeCreate']) this.beforeCreate();
    if (this['aroundCreate']) this.aroundCreate();
    that = this;
    return Client.collection(this.collection).insert(object, function(err, result) {
      result._id = result._id.toString();
      that._id = result._id;
      if (that['aroundCreate']) that.aroundCreate();
      if (that['afterCreate']) that.afterCreate();
      return process.nextTick(function() {
        if (callback) return callback(err, result);
      });
    });
  };

  MongoritoModel.prototype.update = function(callback, fromSave) {
    var object, that, _id;
    if (fromSave == null) fromSave = false;
    object = this.fields();
    _id = new mongolian.ObjectId(object._id);
    delete object._id;
    if (this['beforeUpdate']) this.beforeUpdate();
    if (this['aroundUpdate']) this.aroundUpdate();
    that = this;
    return Client.collection(this.collection).update({
      _id: _id
    }, object, function(err, rowsUpdated) {
      if (that['aroundUpdate']) that.aroundUpdate();
      if (that['afterUpdate']) that.afterUpdate();
      return process.nextTick(function() {
        if (callback) return callback(err, rowsUpdated);
      });
    });
  };

  MongoritoModel.prototype.remove = function(callback) {
    var object, that, _id;
    object = this.fields();
    _id = new mongolian.ObjectId(object._id);
    if (this['beforeRemove']) this.beforeRemove();
    if (this['aroundRemove']) this.aroundRemove();
    that = this;
    return Client.collection(this.collection).remove({
      _id: _id
    }, function(err) {
      if (that['aroundRemove']) that.aroundRemove();
      if (that['afterRemove']) that.afterRemove();
      return process.nextTick(function() {
        if (callback) return callback(err);
      });
    });
  };

  return MongoritoModel;

})();

GenericModel = (function(_super) {

  __extends(GenericModel, _super);

  function GenericModel() {
    GenericModel.__super__.constructor.apply(this, arguments);
  }

  return GenericModel;

})(MongoritoModel);

module.exports = {
  connect: Mongorito.connect,
  disconnect: Mongorito.disconnect,
  bake: Mongorito.bake,
  Model: MongoritoModel
};
