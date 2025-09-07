const sessionManager = require('../sessions')

exports.reset = async (bot, chatID) => {
    const sessions = sessionManager.getSession()
    resetSession(sessions)
    await bot.sendMessage(chatID, "Session reset.");
}
