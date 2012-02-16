var Mongorito, Post,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Mongorito = require('../lib/mongorito');

Mongorito.connect('databaseName', ['127.0.0.1:27017']);

Post = (function(_super) {

  __extends(Post, _super);

  function Post() {
    Post.__super__.constructor.call(this, 'posts');
  }

  return Post;

})(Mongorito.Model);

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
