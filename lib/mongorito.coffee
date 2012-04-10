mongolian = require 'mongolian'
async = require 'async'
memcacher = require 'memcacher'
inflect = require 'i'
Client = undefined
Cache = undefined

`
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
`

class Mongorito
	@disconnect: ->
		do Client.close
	
	@connect: (servers = []) ->
		Client = new mongolian servers[0]
		Client.log=
			debug: ->
			info: ->
			warn: ->
			error: ->
	
	@cache: (servers = []) ->
		Cache = new memcacher servers
	
	@bake: (model) ->
		extendsClass(model, MongoritoModel)
		object = new model
		model.collectionName = object.collectionName
		model.model = model
		model


class MongoritoModel
	constructor: (@collectionName = '') ->
	
	fields: ->
		notFields = ['constructor', 'save', 'collectionName', 'create', 'fields', 'update', 'remove', 'beforeCreate', 'aroundCreate', 'afterCreate', 'beforeUpdate', 'aroundUpdate', 'afterUpdate']
		fields = {}
		for field of @
			fields[field] = @[field] if -1 is notFields.indexOf field
		fields
	
	@bakeModelsFromItems: (items, _model) ->
		models = []
		for item in items
			item._id = item._id.toString()
			model = new _model
			model.collectionName = _model.collectionName
			for field of item
				model[field] = item[field]
			models.push model
		models
	
	@find: (options, callback) ->
		if typeof options is 'function'
			callback = options
			options = {}
		else
			if options.callback
				callback = options.callback
				delete options.callback
		
		that = @
		
		query = (done) ->
			fields = {}
			notFields = ['limit', 'skip', 'sort']
			for property of options
				fields[property] = options[property] if options.hasOwnProperty(property) and notFields.indexOf(property) is -1
			request = Client.collection(that.collectionName).find(fields)
			request = request.limit options.limit if options.limit
			request = request.skip options.skip if options.skip
			request = request.sort options.sort if options.sort
			request.toArray (err, items) ->
				for item in items
					item._id = item._id.toString()
				done err, items
		
		if not Cache
			return query (err, items) ->
				models = that.bakeModelsFromItems items, that.model
				callback err, models
		
		key = "#{ @collectionName }-#{ JSON.stringify(options) }"
		
		Cache.get key, (err, result) ->
			if not result
				query (err, items) ->
					Cache.set key, JSON.stringify(items), 86400, [that.collectionName], ->
						models = that.bakeModelsFromItems items, that.model
						callback err, models
			else
				models = that.bakeModelsFromItems JSON.parse(result), that.model
				callback err, models
	
	_triggerBefore: (operation) ->
		if operation == "update"
			do @beforeUpdate if @['beforeUpdate']
			do @aroundUpdate if @['aroundUpdate']
		else
			do @beforeCreate if @['beforeCreate']
			do @aroundCreate if @['aroundCreate']
	
	save: (callback) ->
		that = @
		fields = do @fields
		# operation = if fields._id then "update" else "create"
		operation = "update"

		@_triggerBefore(operation)

		notFields = ['constructor', 'save', 'collectionName', 'create', 'fields', 'update', 'remove', 'models']
		keys = []
		for field of @
			keys.push field if -1 is notFields.indexOf field
		
		async.filter keys, (key, nextKey) ->
			if that["validate#{ inflect.camelize key }"]
				that["validate#{ inflect.camelize key }"] (valid) ->
					nextKey not valid
			else
				nextKey false
		, (results) ->
			return callback yes, results if results.length > 0
			
			performOperation = -> that[operation](callback, yes)

			if Cache then Cache.delByTag that.collectionName, performOperation else do performOperation
		
	create: (callback, fromSave = no) ->
		object = @fields()
		that = @
		
		@_triggerBefore("create") unless fromSave
		
		Client.collection(@collectionName).insert object, (err, result) ->
			result._id = result._id.toString()
			that._id = result._id
			do that.aroundCreate if that['aroundCreate']
			do that.afterCreate if that['afterCreate']
			callback err, result if callback
		
	update: (callback, fromSave = no) ->
		@_triggerBefore("update") unless fromSave
		
		object = @fields()
		_id = new mongolian.ObjectId object._id
		delete object._id

		that = @
		
		Client.collection(@collectionName).update { _id: _id }, object, (err, rowsUpdated) ->
			do that.aroundUpdate if that['aroundUpdate']
			do that.afterUpdate if that['afterUpdate']
			callback err, rowsUpdated if callback
	
	remove: (callback) ->
		object = @fields()
		
		_id = new mongolian.ObjectId object._id
		
		do @beforeRemove if @['beforeRemove']
		do @aroundRemove if @['aroundRemove']
		that = @
		query = ->
			Client.collection(that.collectionName).remove _id: _id, (err) ->
				do that.aroundRemove if that['aroundRemove']
				do that.afterRemove if that['afterRemove']
				callback err if callback
		if Cache
			Cache.delByTag @collectionName, query
		else
			do query

module.exports=
	connect: Mongorito.connect
	disconnect: Mongorito.disconnect
	cache: Mongorito.cache
	bake: Mongorito.bake
	Model: MongoritoModel