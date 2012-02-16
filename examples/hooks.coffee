Mongorito = require '../lib/mongorito'

Mongorito.connect 'databaseName', ['127.0.0.1:27017']

class Post
	constructor: ->
		super 'posts'
	
	beforeCreate: -> # before creating post
		
	aroundCreate: -> # before and after creating post
	
	afterCreate: -> # after creating post
	
	beforeUpdate: -> # before updating post
	
	aroundUpdate: -> # before and after updating post
	
	afterUpdate: -> # after updating post

Post = Mongorito.bake Post