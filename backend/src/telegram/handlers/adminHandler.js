const ck = require('ckey')
const csv = require('../../csv');
const sheet = require('../../sheet');
const { getRowIndex } = require('../utils/utils')
const sessionManager = require('../sessions');
const adminChatID = ck.ADMIN_CHAT_ID
const csvPath = csv.getPath()

async function handleAdminCallback(query, bot) {
    const data = JSON.parse(query.data)
    const userID = data.user
    const userSession = sessionManager.getSession(userID);
    const csvFile = await csv.getCSV()

    if (!userSession) return bot.sendMessage(adminChatID, `No session found for user ${userID}`);

    if (data.action === 'csv') {
        await bot.sendMessage(adminChatID, "Updating CSV...")
        const formData = userSession.form
        const allProducts = formData.products
        const changedProducts = allProducts.filter(p =>
            Number(p.ProductID) < 1000 && p.Quantity && p.Quantity !== ""
        )
        let updates = csvFile
        for (const p of changedProducts) {
            updates = csv.updateCSV(updates, p.ProductID, p.Quantity);
        }
        await csv.writeCSV(csvPath, updates);
        await bot.sendMessage(adminChatID, "CSV updated")
        await bot.sendDocument(adminChatID, csvPath)
        console.log("Changed Products:", changedProducts)
        console.log("Before update CSV:", csvFile)
        console.log("After update CSV:", updates)

    }


    if (data.action === 'sheet') {
        bot.sendMessage(adminChatID, "Updating Sheets...")

        const allProducts = formData.products
        const changedProducts = allProducts.filter(p => (p.Quantity && p.Quantity != ""))

        const response = await sheet.get("test31!A:A")
        const rows = response.data.values

        for (const productID in changes) {
            const rowIndex = getRowIndex(rows, productID)
            if (!rowIndex) continue
            await sheet.update(`test31!D${rowIndex}`, [[newStock]])
        }
        bot.sendMessage(adminChatID, "Google Sheets updated")
    }

}

module.exports = { handleAdminCallback }