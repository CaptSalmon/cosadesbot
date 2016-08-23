// Generated by CoffeeScript 1.10.0
var config, formatDate, getCurrencies, logger, misc, oil, pq, search;

logger = require('winston');

misc = require('../lib/misc');

config = require('../lib/config');

pq = require('../lib/promise');

search = function() {
  return misc.get("https://openexchangerates.org/api/latest.json", {
    qs: {
      app_id: config.options.exchangekey
    },
    json: true
  });
};

getCurrencies = function() {
  return misc.get("https://openexchangerates.org/api/currencies.json", {
    json: true
  });
};

oil = function() {
  return misc.get("http://www.forexpf.ru/_informer_/commodities.php").then(function(first) {
    var id;
    id = /comod\.php\?id=(\d+)/.exec(first)[1];
    return misc.get("http://www.forexpf.ru/_informer_/comod.php?id=" + id);
  }).then(function(second) {
    var cbrenta, cbrentb;
    cbrenta = Number(/document\.getElementById\(\"cbrenta\"\)\.innerHTML=\"([\d\.]+)\"/.exec(second)[1]);
    cbrentb = Number(/document\.getElementById\(\"cbrentb\"\)\.innerHTML=\"([\d\.]+)\"/.exec(second)[1]);
    return (cbrenta + cbrentb) / 2;
  });
};

formatDate = function(date) {
  var d, m, y;
  d = date.getDate();
  if (d < 10) {
    d = "0" + d;
  }
  m = date.getMonth() + 1;
  if (m < 10) {
    m = "0" + m;
  }
  y = date.getFullYear();
  return (d + "." + m + "." + y + " ") + date.toLocaleTimeString();
};

module.exports = {
  name: 'Currency',
  pattern: /!(курс|деньги)(?:\s+([\d\.]+)?\s*([A-Za-z]{3})\s*([A-Za-z]{3})?)?\s*$/,
  isConf: true,
  searchCached: function() {
    if ((this.lastResultTime != null) && Date.now() - this.lastResultTime < 1800 * 1000) {
      return pq.resolved(this.lastResult);
    } else {
      return search();
    }
  },
  onMsg: function(msg, safe) {
    var amount, buf, isSpecific, reqFrom, reqTo, resQuery;
    if (msg.match[1].toLowerCase() === 'деньги') {
      buf = '';
      safe(getCurrencies().then(function(c) {
        var k, v;
        for (k in c) {
          v = c[k];
          buf += k + " - " + v + "\n";
        }
        return msg.send(buf);
      }));
      return;
    }
    if (msg.match[3] != null) {
      amount = msg.match[2] != null ? Number(msg.match[2]) : 1;
      reqFrom = msg.match[3].toUpperCase();
      reqTo = msg.match[4] != null ? msg.match[4].toUpperCase() : 'RUB';
      isSpecific = true;
    } else {
      isSpecific = false;
    }
    if (isSpecific) {
      resQuery = safe(pq.all([this.searchCached()]));
    } else {
      resQuery = safe(pq.all([search(), oil()]));
    }
    return resQuery.then((function(_this) {
      return function(arg) {
        var calc, date, e, error, json, oil, ref, reqToS, txt;
        json = arg[0], oil = arg[1];
        try {
          _this.lastResult = json;
          _this.lastResultTime = Date.now();
          date = new Date(json.timestamp * 1000);
          calc = function(from, to, amount) {
            var f, t;
            if (amount == null) {
              amount = 1;
            }
            f = json.rates[from];
            t = json.rates[to];
            return '*' + (t / f * amount).toFixed(2) + '*';
          };
          if (isSpecific) {
            if (amount > 0 && amount < 1000000000) {
              if (reqFrom in json.rates && reqTo in json.rates) {
                if (reqTo === 'RUB') {
                  reqToS = 'септимов';
                } else if (reqTo === 'BYR') {
                  reqToS = 'перков';
                } else if (reqTo === 'BYN') {
                  reqToS = 'новоперков';
                } else {
                  reqToS = reqTo;
                }
                txt = amount + " " + reqFrom + " = " + (calc(reqFrom, reqTo, amount)) + " " + reqToS;
                return msg.send(txt, {
                  parseMode: 'Markdown'
                });
              } else {
                return msg.reply('Не знаю такой валюты!');
              }
            } else {
              return msg.reply('Не могу посчитать!');
            }
          } else {
            txt = "Курс на *" + (formatDate(date)) + "*\n\n1 Brent = *" + ((ref = oil != null ? oil.toFixed(2) : void 0) != null ? ref : '???') + "*$\n1 $ = " + (calc('USD', 'RUB')) + " септимов\n1 Euro = " + (calc('EUR', 'RUB')) + " септимов\n1 CHF = " + (calc('CHF', 'RUB')) + " септимов\n1 Pound = " + (calc('GBP', 'EUR')) + " евро = " + (calc('GBP', 'RUB')) + " септимов\n1 Bitcoin = " + (calc('BTC', 'USD')) + "$ = " + (calc('BTC', 'RUB')) + " септимов\n1 гривна = " + (calc('UAH', 'RUB')) + " септимов\n1 септимов = " + (calc('RUB', 'BYN')) + " новоперков";
            return msg.send(txt, {
              parseMode: 'Markdown'
            });
          }
        } catch (error) {
          e = error;
          return _this._onError(msg, e);
        }
      };
    })(this));
  },
  onError: function(msg) {
    return msg.send('65 дрейков, как у дедов!');
  }
};
