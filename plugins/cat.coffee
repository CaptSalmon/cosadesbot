misc = require '../lib/misc'

module.exports =
    pattern: /!(кот|киса|cat|каджит|хаджит)$/
    name: 'Cats'

    onMsg: (msg, safe) ->
        @sendImageFromUrl msg, 'http://thecatapi.com/api/images/get'
        