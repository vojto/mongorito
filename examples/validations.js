var Mongorito, Tweet, tweet,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Mongorito = require('../lib/mongorito');

Mongorito.connect('databaseName', ['127.0.0.1:27017']);

Tweet = (function(_super) {

  __extends(Tweet, _super);

  function Tweet() {
    Tweet.__super__.constructor.call(this, 'tweets');
  }

  Tweet.prototype.validateBody = function(callback) {
    if (this.body.length >= 140) {
      return callback(false);
    } else {
      return callback(true);
    }
  };

  return Tweet;

})(Mongorito.Model);

Tweet = Mongorito.bake(Tweet);

tweet = new Tweet;

tweet.body = 'I want to be super-super-super-super long! Reallly, reallly, long!!!! In fact, I am VEEERY long! You\'ve never seen such a looooooong tweeeeeet!';

tweet.save(function(err, results) {});
