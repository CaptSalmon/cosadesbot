// Generated by CoffeeScript 1.10.0
var logger, msgCache, query;

logger = require('winston');

msgCache = require('./msg_cache');

query = require('./query');

exports.sendMessage = function(args) {
  logger.outMsg("(" + args.chat_id + ") <<< " + args.text);
  if (args.reply_markup != null) {
    args.reply_markup = JSON.stringify(args.reply_markup);
  }
  return query('sendMessage', args);
};

exports.editMessageText = function(args) {
  logger.outMsg("(" + args.chat_id + ") (edit " + args.message_id + ") <<< " + args.text);
  if (args.reply_markup != null) {
    args.reply_markup = JSON.stringify(args.reply_markup);
  }
  return query('editMessageText', args);
};

exports.sendPhoto = function(args) {
  var caption, ref, ref1;
  if (args.caption != null) {
    caption = ': ' + args.caption;
  } else {
    caption = '';
  }
  logger.outMsg("(" + args.chat_id + ") <<< [" + ((ref = args.photo.options) != null ? ref.contentType : void 0) + ", " + ((ref1 = args.photo.value) != null ? ref1.length : void 0) + " bytes" + caption + "]");
  return query('sendPhoto', args, {
    multipart: true
  });
};

exports.forwardMessage = function(args) {
  logger.outMsg("(" + args.chat_id + ") <<< [Forward: " + args.message_id + "]");
  return query('forwardMessage', args).then(function(msg) {
    msgCache.add(msg);
    return msg;
  });
};

exports.sendAudio = function(args) {
  var ref;
  logger.outMsg("(" + args.chat_id + ") <<< [Audio (" + ((ref = args.audio.value) != null ? ref.length : void 0) + " bytes)]");
  return query('sendAudio', args, {
    multipart: true
  });
};

exports.sendVoice = function(args) {
  var ref;
  logger.outMsg("(" + args.chat_id + ") <<< [Voice (" + ((ref = args.voice.value) != null ? ref.length : void 0) + " bytes)]");
  return query('sendVoice', args, {
    multipart: true
  });
};

exports.getInfo = function() {
  logger.info("Getting user info...");
  return query('getMe');
};

exports.sendSticker = function(args, fn) {
  logger.outMsg("(" + args.chat_id + ") <<< [Sticker: " + fn + "]");
  return query('sendSticker', args, {
    multipart: true
  });
};

exports.answerCallbackQuery = function(args) {
  logger.outMsg("(callback answer) <<< " + args.text);
  return query('answerCallbackQuery', args);
};

exports.leaveChat = function(args) {
  logger.info("Leaving chat: " + args.chat_id);
  return query('leaveChat', args);
};