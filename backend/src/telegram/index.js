const ck = require('ckey')
const TelegramBot = require("node-telegram-bot-api")

const TOKEN = ck.TELEGRAM_TOKEN
const URL = ck.PUBLIC_URL
const adminChatID = ck.ADMIN_CHAT_ID

const bot = new TelegramBot(TOKEN)
bot.setWebHook(`${URL}/bot${TOKEN}`)

const sessionManager = require('./sessions');

const { handleAdminCallback } = require('./handlers/adminHandler')
const { handleUserCallback } = require('./handlers/userHandler')


let chatID

function init() {
    bot.onText(/\/start/, (msg) => {
        chatID = msg.chat.id;

        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Start a Count', web_app: { url: 'https://sixixinvbot.onrender.com' } }],
                    [{ text: 'Request Restock', callback_data: 'restock' }],
                    [{ text: 'Reset', callback_data: 'reset' }]
                ]
            }
        };

        bot.sendMessage(chatID, 'Welcome to 6ixINVBot', options);
    });



    bot.on("callback_query", async (query) => {
        chatID = query.message.chat.id
        const data = query.data
        const sessions = sessionManager.getSession(chatID);
        sessions.action = data.action

        if (chatID == adminChatID) {
            handleAdminCallback(query, bot);
        } else {
            handleUserCallback(query, bot, chatID);
        }
    })
}

function getChatID() {
    return chatID
}

module.exports = { init, bot, getChatID }
