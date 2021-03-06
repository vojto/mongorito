Mongorito = require '../lib/mongorito'

Mongorito.connect ['mongo://127.0.0.1:27017/mongorito']
Mongorito.cache ['127.0.0.1:11211']

require 'should'
async = require 'async'

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
	
	describe 'fetching records', ->
		it 'should fetch only one post', (done) ->
			Post.find limit: 1, (err, posts) ->
				posts.length.should.equal 1
				do done
			
		it 'should fetch post by title', (done) ->
			Post.find title: 'Edited title!', (err, posts) ->
				posts.length.should.equal 1
				do done
		
		it 'should create another post and fetch only one', (done) ->
			post = new Post
			post.title = 'Just created'
			post.author = 'Vadim'
			post.save ->
				Post.find limit: 1, skip: 1, (err, posts) ->
					posts.length.should.equal 1
					do done
		
		it 'should fetch posts, ordering by the time of creation', (done) ->
			Post.find sort: { _id: -1 }, (err, posts) ->
				posts[0].title is 'Just created' and posts.length.should.equal 2
				do done
		
	
	describe 'deleting records', ->
		it 'should remove all posts', (done) ->
			Post.find (err, posts) ->
				async.forEach posts, (post, nextPost) ->
					post.remove ->
						do nextPost
				, ->
					Post.find (err, posts) ->
						posts.length.should.equal 0
						do done