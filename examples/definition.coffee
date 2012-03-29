Mongorito = require '../lib/mongorito'

Mongorito.connect ['mongo://127.0.0.1:27017/databaseName']

class Post
	constructor: ->
		super 'posts' # REQUIRED STEP
		
Post = Mongorito.bake Post # REQUIRED STEP