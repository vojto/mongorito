var Mongorito, Post;

Mongorito = require('../lib/mongorito');

Mongorito.connect(['mongo://127.0.0.1:27017/databaseName']);

Post = (function() {

  function Post() {
    Post.__super__.constructor.call(this, 'posts');
  }

  return Post;

})();

Post = Mongorito.bake(Post);
