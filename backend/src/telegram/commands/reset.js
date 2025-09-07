const sessionManager = require('../sessions')

exports.reset = async (bot, chatID) => {
    const sessions = sessionManager.getSession()
    sessions.resetSession(chatID)
    await bot.sendMessage(chatID, "Session reset.");
}
