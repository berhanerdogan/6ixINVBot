const sessionManager = require('../sessions')

exports.reset = async (bot, chatID) => {
    const sessions = sessionManager.getSession()
    sessionManager.resetSession(sessions)
    await bot.sendMessage(chatID, "Session reset.");
}
