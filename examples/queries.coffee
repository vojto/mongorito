Mongorito = require '../lib/mongorito'

Mongorito.connect 'databaseName', ['127.0.0.1:27017']

class Post
	constructor: ->
		super 'posts'
		
Post = Mongorito.bake Post

Post.find (err, posts) ->
	for post in posts
		console.log post.title # post is a Post model, so you can perform all usual operations

Post.find { title: 'Nice title!' }, (err, posts) ->

Post.findWithLimit 5, (err, posts) -> # getting only first 5 posts

Post.findWithLimit { author: 'Drew' }, 5, (err, posts) -> # getting only first 5 posts with author = Drew

Post.findWithLimit 5, 2, (err, posts) -> # getting only 5 posts, skipping first 2

Post.findWithLimit { author: 'Drew' }, 5, 2, (err, posts) -> # getting only 5 posts, skipping first 2, with author = Drew

Post.findWithOrder { _id: -1 }, (err, posts) -> # getting posts, sorted by _id

Post.findWithOrderAndLimit { _id: -1 }, 5, (err, posts) -> # getting first 5 posts, sorted by _id

Post.findWithOrderAndLimit { _id: -1 }, 5, 2, (err, posts) -> # getting 5 posts, skipping first 2, sorted by _id

Post.findWithOrderAndLimit { author: 'Drew' }, { _id: -1 }, 5, 2, (err, posts) -> # getting 5 posts, skipping first 2, sorted by _id, with author = Drew