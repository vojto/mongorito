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
