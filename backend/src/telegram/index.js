const ck = require('ckey')
const TelegramBot = require("node-telegram-bot-api")

const TOKEN = ck.TELEGRAM_TOKEN
const adminChatID = ck.ADMIN_CHAT_ID

const bot = new TelegramBot(TOKEN, { polling: true })
const sessionManager = require('./sessions');

const getStock = require('./commands/getStock');
const getflowerstock = require('./commands/getFlowerStock')
const { handleAdminCallback } = require('./handlers/adminHandler')
const { handleUserCallback } = require('./handlers/userHandler')

function init() {

    getStock(bot)
    getflowerstock(bot)

    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;

        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Start a Count', web_app: { url: 'https://5304975cf175.ngrok-free.app' } }],
                    [{ text: 'Request Restock', callback_data: 'restock' }],
                    [{ text: 'Send Report', callback_data: 'report' }],
                    [{ text: 'Reset', callback_data: 'reset' }],
                ]
            }
        };

        bot.sendMessage(chatId, 'Welcome to 6ixINVBot', options);
    });




    bot.on("callback_query", async (query) => {
        const chatID = query.message.chat.id
        const data = query.data
        const sessions = sessionManager.getSession(chatID);
        sessions.action = data.action

        if (chatID == adminChatID) {
            handleAdminCallback(query, bot);
        } else {
            handleUserCallback(query, bot);
        }
    })

    bot.on("message", async (msg) => {
        const chatID = msg.chat.id
        const sessions = sessionManager.getSession(chatID);
        const action = sessions.action
        if (msg.reply_to_message) {
            const newCount = msg.text.trim()
            const productID = sessions.activeProduct

            if (!isNaN(newCount)) {
                await bot.sendMessage(chatID, `New stock will be: ${newCount}`)
                if (action === "product") {
                    if (!sessions.changes.productChanges[productID]) sessions.changes.productChanges[productID] = {}
                    sessions.changes.productChanges[productID].newStock = Number(newCount)
                } else if (action === "flower") {
                    if (!sessions.changes.flowerChanges[productID]) sessions.changes.flowerChanges[productID] = {}
                    sessions.changes.flowerChanges[productID].newStock = Number(newCount)
                }
            } else {
                await bot.sendMessage(chatID, "Please enter a number!")
            }
        }
    })

}

module.exports = { init };
