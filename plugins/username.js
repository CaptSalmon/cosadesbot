// Generated by CoffeeScript 1.10.0
var msgCache;

msgCache = require('../lib/msg_cache');

module.exports = {
  name: 'Username',
  pattern: /!username (\d+)/,
  isPrivileged: true,
  warnPrivileged: false,
  onMsg: function(msg) {
    var id, usr;
    id = Number(msg.match[1]);
    usr = msgCache.getUserById(id);
    if (usr != null) {
      return msg.reply('@' + usr.username);
    } else {
      return msg.reply('Не найдено');
    }
  }
};