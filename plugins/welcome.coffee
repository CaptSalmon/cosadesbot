config = require '../lib/config'
misc = require '../lib/misc'

module.exports =
    name: 'Welcome'
    pattern: /!(welcome|intro)(?: (on|off))?$/

    init: ->
        @enabledChats = misc.loadJson('welcome') ? []

    isAcceptMsg: (msg) ->
        msg.new_chat_participant? or @matchPattern(msg, msg.text)

    onMsg: (msg) ->
        if not msg.new_chat_participant?
            if msg.match[1].toLowerCase() == 'welcome'
                isOn = msg.match[2] != 'off'
                if isOn and msg.chat.id not in @enabledChats
                    @enabledChats.push msg.chat.id
                    msg.send "Включено приветствие для этого чата."
                else
                    @enabledChats = @enabledChats.filter (id) -> id != msg.chat.id
                    msg.send "Отключено приветствие для этого чата."
                misc.saveJson 'welcome', @enabledChats
            else
                @intro msg
        else
            #legitimate!
            user = msg.new_chat_participant
            if user.username == config.userName
                #console.log "$$$$ #{user.username} $$$$"
                @intro msg
            else
                if msg.chat.id in @enabledChats and not (user.username? and user.username.endsWith('bot'))
                    @welcomeUser msg, user

    intro: (msg) ->
        msg.send "Эй, черти. Бутылку скуумы мне и прочь отсюда. А если есть какое дело ко мне, пиши /help и я не выебу тебя в твой висящий пролапс."

    welcomeUser: (msg, user) ->
        msg.send "Привет нвах, #{user.first_name}!"