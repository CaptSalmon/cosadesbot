// Generated by CoffeeScript 1.10.0
var _clone, cacheCounter, cacheMessages, cacheUsers, prevCacheMessages, rotateCache;

prevCacheMessages = {};

cacheMessages = {};

cacheUsers = {};

_clone = function(msg) {
  var i, k, len, ref, res;
  res = {};
  ref = ['message_id', 'from', 'date', 'chat', 'forward_from', 'forward_date', 'text'];
  for (i = 0, len = ref.length; i < len; i++) {
    k = ref[i];
    if (msg[k] != null) {
      res[k] = msg[k];
    }
  }
  if (msg.reply_to_message != null) {
    res.reply_to_message = _clone(msg.reply_to_message);
  }
  return res;
};

exports.tryResolve = function(msg) {
  var cached, k, v;
  cached = cacheMessages[msg.message_id];
  if (cached == null) {
    cached = prevCacheMessages[msg.message_id];
  }
  if (cached != null) {
    for (k in cached) {
      v = cached[k];
      if (!(k in msg)) {
        msg[k] = v;
      }
    }
  }
  return msg;
};

exports.getUserById = function(userId) {
  return cacheUsers[userId];
};

cacheCounter = 0;

rotateCache = function() {
  cacheCounter += 1;
  if (cacheCounter > 1000) {
    cacheCounter = 0;
    prevCacheMessages = cacheMessages;
    return cacheMessages = {};
  }
};

exports.add = function(msg) {
  rotateCache();
  cacheMessages[msg.message_id] = _clone(msg);
  cacheUsers[msg.from.id] = msg.from;
  if (msg.forward_from != null) {
    return cacheUsers[msg.forward_from.id] = msg.forward_from;
  }
};
