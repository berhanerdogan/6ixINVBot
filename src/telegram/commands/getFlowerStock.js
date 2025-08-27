const sheet = require('../../sheet');
const sessionManager = require('../sessions');

module.exports = async (bot) => {

    bot.onText(/\/getflowerstock$/, async (msg) => {
        const chatID = msg.chat.id
        const session = sessionManager.getSession(chatID)

        try {
            const response = await sheet.get("test31!A:D")
            const values = response.data.values
            const keyboard = values.map(row => {
                const [id, sku, name, quantity] = row
                return [{
                    text: `${name} | ${quantity}`,
                    callback_data: JSON.stringify({ action: 'flower', id, quantity })
                }]
            })
            bot.sendMessage(msg.chat.id, "Products:", {
                reply_markup: { inline_keyboard: keyboard }
            })
        } catch (error) {
            bot.sendMessage(msg.chat.id, "Cannot get the sheet")
        }
    })
}