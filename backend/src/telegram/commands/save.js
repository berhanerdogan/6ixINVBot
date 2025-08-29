require('dotenv').config();
const sessionManager = require('../sessions')
const adminChatID = process.env.ADMIN_CHAT_ID

module.exports = async (bot) => {
    bot.onText(/\/save/, async (msg) => {
        const chatID = msg.chat.id
        const userSession = sessionManager.getSession(chatID)
        
        let messageText = `User ${chatID} made the following changes:\n`;
        for (const [productID, change] of Object.entries(userSession.changes.productChanges)) {
            messageText += `Product ${productID}: ${change.Quantity} → ${change.newStock}\n`;
        }
        for (const [productID, change] of Object.entries(userSession.changes.flowerChanges)) {
            messageText += `Flower ${productID}: ${change.oldStock} → ${change.newStock}\n`;
        }
        
        await bot.sendMessage(adminChatID, messageText, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Export as CSV", callback_data: JSON.stringify({ action: "csv", user: chatID }) }
                    ],
                    [
                        { text: "Update Google Sheets", callback_data: JSON.stringify({ action: "sheet", user: chatID }) }
                    ]
                ]
            }
        })
        console.log(`session after save: ${JSON.stringify(userSession)}`)
    })
}
