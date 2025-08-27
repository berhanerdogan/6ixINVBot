const csv = require('../../csv');
const sessionManager = require('../sessions');

module.exports = async (bot) => {
    
    bot.onText(/\/getstock$/, async (msg) => { 
        const chatID = msg.chat.id
        const session = sessionManager.getSession(chatID)
        try {
            const results = await csv.getCSV()
            const keyboard = results.map(p => ([{
                text: `${p.Name} | ${p.Quantity}`,
                callback_data: JSON.stringify({ action: 'product', ProductID: p.ProductID, Quantity: p.Quantity })
            }]))
            bot.sendMessage(chatID, "Products:", {
                reply_markup: { inline_keyboard: keyboard }
            })
        } catch (error) {
            bot.sendMessage(chatID, "Cannot get the sheet")
        }   
    })
}