var Mongorito, Post;

Mongorito = require('../lib/mongorito');

Mongorito.connect('databaseName', ['127.0.0.1:27017']);

Post = (function() {

  function Post() {
    Post.__super__.constructor.call(this, 'posts');
  }

  Post.prototype.beforeCreate = function() {};

  Post.prototype.aroundCreate = function() {};

  Post.prototype.afterCreate = function() {};

  Post.prototype.beforeUpdate = function() {};

  Post.prototype.aroundUpdate = function() {};

  Post.prototype.afterUpdate = function() {};

  return Post;

})();

Post = Mongorito.bake(Post);
