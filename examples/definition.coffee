Mongorito = require '../lib/mongorito'

Mongorito.connect 'databaseName', ['127.0.0.1:27017']

class Post
	constructor: ->
		super 'posts' # REQUIRED STEP
		
Post = Mongorito.bake Post # REQUIRED STEP