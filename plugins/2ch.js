// Generated by CoffeeScript 1.10.0
var BOARD, HOST, fixText, getPostText, isButthurt, isButthurtThread, isGoodPost, isGoodThread, logger, misc, randomPost, randomThread;

logger = require('winston');

misc = require('../lib/misc');

BOARD = 'b';

HOST = '2ch.hk';

isButthurt = function(comment) {
  return comment.indexOf('<br>@<br>') !== -1;
};

isButthurtThread = function(comment) {
  return isButthurt(comment) || comment.toLowerCase().indexOf('бугурт') !== -1;
};

isGoodThread = function(thread) {
  return thread.posts_count >= 50 && !thread.banned && !thread.closed;
};

isGoodPost = function(post) {
  return fixText(post.comment).trim().length >= 50;
};

randomThread = function(anyPost) {
  return misc.getAsCloud("https://" + HOST + "/" + BOARD + "/catalog.json").then(function(data) {
    data = JSON.parse(data);
    return misc.randomChoice(data.threads.filter(function(thread) {
      return isGoodThread(thread) && (anyPost || isButthurtThread(thread.comment));
    }));
  });
};

randomPost = function(id, anyPost) {
  return misc.getAsCloud("https://" + HOST + "/" + BOARD + "/res/" + id + ".json").then(function(data) {
    data = JSON.parse(data);
    return misc.randomChoice(data.threads[0].posts.filter(function(post) {
      if (anyPost) {
        return isGoodPost(post);
      } else {
        return isButthurt(post.comment);
      }
    }));
  });
};

fixText = function(text) {
  text = text.replace(/\<br\>/g, '\n').replace(/\<span class="(.*?)"\>(.*?)\<\/span\>/g, '$2').replace(/\<a.*?\<\/a\>/g, '');
  if (text.length > 1500) {
    text = text.substr(0, 1500);
  }
  return text;
};

getPostText = function(post) {
  var text;
  text = fixText(post.comment).trim();
  if (post.files.length > 0 && post.files[0].nsfw === 0) {
    text += "\n\nhttps://" + HOST + "/" + BOARD + "/" + post.files[0].path;
  }
  return text;
};

module.exports = {
  name: 'Butthurt thread',
  isPrivileged: true,
  warnPrivileged: false,
  pattern: /!(кек|сас|kek|sas)/,
  onMsg: function(msg, safe) {
    var isSas, ref;
    isSas = (ref = msg.match[1].toLowerCase()) === 'сас' || ref === 'sas';
    return safe(randomThread(isSas)).then(function(thread) {
      if (thread == null) {
        return msg.reply('В Балморе всё спокойно!');
      } else {
        return safe(randomPost(thread.num, isSas)).then(function(post) {
          if (post == null) {
            return msg.reply('В Балморе всё спокойно!');
          } else {
            return msg.send(getPostText(post), {
              parseMode: 'HTML'
            });
          }
        });
      }
    });
  },
  isSudo: function(msg) {
    return msg.chat.type === 'private' || this.bot.isSudo(msg);
  },
  onError: function(msg) {
    return msg.reply('ты нвах');
  }
};
