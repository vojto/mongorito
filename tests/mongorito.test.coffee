Mongorito = require '../lib/mongorito'

Mongorito.connect 'mongorito', ['127.0.0.1:27017']
Mongorito.cache ['127.0.0.1:11211']

require 'should'

class Post
	constructor: ->
		super 'posts'

Post = Mongorito.bake Post

describe 'Mongorito', ->
	describe 'creating new record', ->
		it 'should create new record in "posts" collection', (done) ->
			post = new Post
			post.title = 'Very nice post!'
			post.author = 'Vadim'
			post.save ->
				Post.find (err, posts) ->
					posts.length.should.equal 1
					do done
	
	describe 'editing record', ->
		it 'should save edited version of the post', (done) ->
			Post.find (err, posts) ->
				post = posts[0]
				post.title = 'Edited title!'
				post.save ->
					do done
	
	describe 'getting record', ->
		it 'should fetch just edited post', (done) ->
			Post.find (err, posts) ->
				posts[0].title.should.equal 'Edited title!'
				do done
	
	describe 'deleting record', ->
		it 'should remove post', (done) ->
			Post.find (err, posts) ->
				posts[0].remove ->
					Post.find (err, posts) ->
						posts.length.should.equal 0
						do done