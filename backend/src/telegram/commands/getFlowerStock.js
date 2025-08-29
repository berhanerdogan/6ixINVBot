const sheet = require('../../sheet');

module.exports = async (bot) => {

    bot.onText(/\/getflowerstock$/, async (msg) => {
        const chatID = msg.chat.id

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
            console.log(`callback data: ${values.callback_data}"`)
            bot.sendMessage(chatID, "Products:", {
                reply_markup: { inline_keyboard: keyboard }
            })
        } catch (error) {
            bot.sendMessage(chatID, "Cannot get the sheet")
        }
    })
}