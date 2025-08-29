require('dotenv').config();
const sheet = require('../../sheet')
const csv = require('../../csv')
const sessionManager = require('../sessions')
const adminChatID = process.env.ADMIN_CHAT_ID



module.exports = async (bot) => {
    bot.onText(/\/requestrestock$/, async (msg) => {
        const chatID = msg.chat.id
        const session = sessionManager.getSession(chatID)
        session.changes.productChanges = {}

        try {
            const products = await csv.getCSV();
            const response = await sheet.get("test31!A:D");
            const flowers = response.data.values.map(row => {
                const [id, sku, name, quantity] = row;
                return { id, name, quantity: Number(quantity) }
            })

            let lowMessage = "Restock needed:\n"
            let lowStock = false

            products.forEach(product => {
                if (Number(product.Quantity < 6)) {
                    lowMessage += `- ${product.Name} | ${product.Quantity} left\n`
                    lowStock = true
                }

            })

            flowers.forEach(flower => {
                if (Number(flower.Quantity < 6)) {
                    lowMessage += `- ${flower.Name} | ${flower.Quantity} left\n`
                    lowStock = true
                }
            })

            if (lowStock) {
                await bot.sendMessage(adminChatID, lowMessage,)
                await bot.sendMessage(chatID, "Restock request sent")
            } else {
                await bot.sendMessage(chatID, "All stocks are sufficient")
            }
            console.log(`session after request restock: ${JSON.stringify(session)}`)

        } catch (error) {
            console.error(error)
            await bot.sendMessage(chatID, "Failed to check the stock")
        }
    })
}
