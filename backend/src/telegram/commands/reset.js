const sessionManager = require('../sessions');

module.exports = async (bot) => {
    bot.onText(/\/reset$/, (msg) => {
        const chatID = msg.chat.id
        const sessions = sessionManager.getSession()
        sessions.resetSession(chatID)
        bot.sendMessage(chatID, "Session reset.");
        console.log(`session after reset: ${JSON.stringify(sessions)}`)
    })
}