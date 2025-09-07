const ck = require('ckey')
const sheet = require('../../sheet')
const csv = require('../../csv')
const adminChatID = ck.ADMIN_CHAT_ID


exports.requestRestock = async (bot, chatID) => {
    try {
        const products = await csv.getCSV();
        const response = await sheet.get("test31!A:D")
        const flowers = response.data.values.slice(1).map(row => {
            const [ID, SKU, Name, Quantity] = row;
            return { ID, Name, Quantity: Quantity }
        })
    
        let lowMessage = "Restock needed:\n"
        let lowStock = false
    
        products.forEach(product => {
            if (Number(product.Quantity) < 6) {
                lowMessage += `- ${product.Name} | ${product.Quantity} left\n`
                lowStock = true
            }
    
        })
    
        flowers.forEach(flower => {
            if (Number(flower.Quantity) < 6) {
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
    
    } catch (error) {
        console.error(error)
        await bot.sendMessage(chatID, "Failed to check the stock")
    }

}



