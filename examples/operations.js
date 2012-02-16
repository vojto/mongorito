var Mongorito, Post, post;

Mongorito = require('../lib/mongorito');

Mongorito.connect('databaseName', ['127.0.0.1:27017']);

Post = (function() {

  function Post() {
    Post.__super__.constructor.call(this, 'posts');
  }

  return Post;

})();

Post = Mongorito.bake(Post);

post = new Post;

post.title = 'Title of the post';

post.content = 'Content of the post';

post.save(function(err, results) {});

post.title = 'Changed title of the previously saved post';

post.save(function(err, results) {});

post.remove(function(err) {});
