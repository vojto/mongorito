var Mongorito, Post;

Mongorito = require('../lib/mongorito');

Mongorito.connect('databaseName', ['127.0.0.1:27017']);

Post = (function() {

  function Post() {
    Post.__super__.constructor.call(this, 'posts');
  }

  return Post;

})();

Post = Mongorito.bake(Post);

Post.find(function(err, posts) {
  var post, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = posts.length; _i < _len; _i++) {
    post = posts[_i];
    _results.push(console.log(post.title));
  }
  return _results;
});

Post.find({
  title: 'Nice title!'
}, function(err, posts) {});

Post.findWithLimit(5, function(err, posts) {});

Post.findWithLimit({
  author: 'Drew'
}, 5, function(err, posts) {});

Post.findWithLimit(5, 2, function(err, posts) {});

Post.findWithLimit({
  author: 'Drew'
}, 5, 2, function(err, posts) {});

Post.findWithOrder({
  _id: -1
}, function(err, posts) {});

Post.findWithOrderAndLimit({
  _id: -1
}, 5, function(err, posts) {});

Post.findWithOrderAndLimit({
  _id: -1
}, 5, 2, function(err, posts) {});

Post.findWithOrderAndLimit({
  author: 'Drew'
}, {
  _id: -1
}, 5, 2, function(err, posts) {});
