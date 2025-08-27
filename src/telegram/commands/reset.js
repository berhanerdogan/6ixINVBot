const sessionManager = require('../sessions');

module.exports = async (bot) => {
    bot.onText(/\/reset$/, (msg) => {
        const chatID = msg.chat.id
        const sessions = sessionManager.getSession
        sessions[chatID] = undefined;
        bot.sendMessage(chatID, "Session reset.");
    })
}