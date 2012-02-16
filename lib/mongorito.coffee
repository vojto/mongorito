mongolian = require 'mongolian'
async = require 'async'
Client = undefined

`String.prototype.plural = function() {
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
}`

class Mongorito
	@disconnect: ->
		do Client.close
	@connect: (database = '', servers = [], username = '', password = '') ->
		if servers.length is 1
			server = new mongolian servers[0]
			Client = server.db database
			Client.log=
				debug: ->
				info: ->
				warn: ->
				error: ->
			Client.auth username, password if username
		else
			# Support comes soon to Replica Sets
			server = new mongolian servers[0]
			Client = server.db database
			Client.log=
				debug: ->
				info: ->
				warn: ->
				error: ->
			Client.auth username, password if username
	
	@bake: (model) ->
		object = new model
		model.collection = object.collection
		model.model = model

class MongoritoModel
	constructor: (@collection = '') ->
	
	fields: ->
		notFields = ['constructor', 'save', 'collection', 'create', 'fields', 'update', 'remove']
		fields = {}
		for field of @
			fields[field] = @[field] if -1 is notFields.indexOf field
		fields
	
	@findById: (id, callback) ->
		that = @
		
		Client.collection(@collection).find({ _id: new mongolian.ObjectId(id.toString()) }).toArray (err, item) ->
			if item.length is 0
				item = item[0]
				item._id = item._id.toString()
				model = new that.model
				model.collection = that.collection
				for field of item
					model[field] = item[field]
			else
				model = no
			
			process.nextTick ->
				callback err, model
	
	@findWithOrderAndLimit: (criteria, order, limit, skip, callback) ->
		if typeof criteria is 'object'
			if typeof order is 'number'
				if typeof limit is 'function'
					callback = limit
					limit = order
					order = criteria
					criteria = {}
				if typeof limit is 'number'
					if typeof skip is 'function'
						callback = skip
						skip = limit
						limit = order
						order = criteria
						criteria = {}
		
		skip = 0 if not skip
		that = @
		
		Client.collection(@collection).find(criteria).sort(order).limit(limit).skip(skip).toArray (err, items) ->
			models = []
			for item in items
				item._id = item._id.toString()
				model = new that.model
				model.collection = that.collection
				for field of item
					model[field] = item[field]
				models.push model
			
			process.nextTick ->
				callback err, models
	
	@findWithOrder: (criteria, order, callback) ->
		if typeof criteria is 'object' and typeof order is 'function'
			callback = order
			order = criteria
			criteria = {}
			order = { _id: -1 }
		
		that = @
		
		Client.collection(@collection).find(criteria).sort(order).toArray (err, items) ->
			models = []
			for item in items
				item._id = item._id.toString()
				model = new that.model
				model.collection = that.collection
				for field of item
					model[field] = item[field]
				models.push model
			
			process.nextTick ->
				callback err, models
	
	@findWithLimit: (criteria, limit, skip, callback) ->
		if typeof criteria is 'number'
			if typeof limit is 'function'
				callback = limit
				limit = criteria
				criteria = {}
			if typeof limit is 'number'
				if typeof skip is 'function'
					callback = skip
					skip = limit
					criteria = {}
		else
			if typeof limit is 'function'
				callback = limit
				limit = 10
			if typeof skip is 'function'
				callback = skip
				skip = 0
		
		that = @
		
		Client.collection(@collection).find(criteria).limit(limit).skip(skip).toArray (err, items) ->
			models = []
			for item in items
				item._id = item._id.toString()
				model = new that.model
				model.collection = that.collection
				for field of item
					model[field] = item[field]
				models.push model
			
			process.nextTick ->
				callback err, models
	
	@find: (criteria = {}, callback) ->
		if typeof(criteria) is 'function'
			callback = criteria
			criteria = {}
		
		that = @
		
		Client.collection(@collection).find(criteria).toArray (err, items) ->
			models = []
			for item in items
				item._id = item._id.toString()
				model = new that.model
				model.collection = that.collection
				for field of item
					model[field] = item[field]
				models.push model
			
			process.nextTick ->
				callback err, models
	
	save: (callback) ->
		that = @
		fields = @fields
		
		notFields = ['constructor', 'save', 'collection', 'create', 'fields', 'update', 'remove', 'models']
		keys = []
		for field of @
			keys.push field if -1 is notFields.indexOf field
		
		async.filter keys, (key, nextKey) ->
			if that["validate#{ key.camelize() }"]
				that["validate#{ key.camelize() }"] (valid) ->
					nextKey not valid
			else
				nextKey false
		, (results) ->
			return callback yes, results if results.length > 0
			
			if fields._id
				that.update callback, yes
			else
				that.create callback, yes
		
	create: (callback, fromSave = no) ->
		object = @fields()
		
		do @beforeCreate if @['beforeCreate']
		do @aroundCreate if @['aroundCreate']
		that = @
		
		Client.collection(@collection).insert object, (err, result) ->
			result._id = result._id.toString()
			that._id = result._id
			do that.aroundCreate if that['aroundCreate']
			do that.afterCreate if that['afterCreate']
			process.nextTick ->
				callback err, result if callback
		
	update: (callback, fromSave = no) ->
		object = @fields()
		_id = new mongolian.ObjectId object._id
		delete object._id
		
		do @beforeUpdate if @['beforeUpdate']
		do @aroundUpdate if @['aroundUpdate']
		that = @
		
		Client.collection(@collection).update { _id: _id }, object, (err, rowsUpdated) ->
			do that.aroundUpdate if that['aroundUpdate']
			do that.afterUpdate if that['afterUpdate']
			process.nextTick ->
				callback err, rowsUpdated if callback
	
	remove: (callback) ->
		object = @fields()
		
		_id = new mongolian.ObjectId object._id
		
		do @beforeRemove if @['beforeRemove']
		do @aroundRemove if @['aroundRemove']
		that = @
		
		Client.collection(@collection).remove { _id: _id }, (err) ->
			do that.aroundRemove if that['aroundRemove']
			do that.afterRemove if that['afterRemove']
			process.nextTick ->
				callback err if callback

module.exports=
	connect: Mongorito.connect
	disconnect: Mongorito.disconnect
	bake: Mongorito.bake
	Model: MongoritoModel