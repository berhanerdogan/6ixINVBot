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
        bot.sendMessage(adminChatID, "Updating CSV...")
        let updates = csvFile
        for (const [productID, change] of Object.entries(userSession.changes.productChanges)) {
            updates = csv.updateCSV(updates, productID, change.newStock);
        }
        await csv.writeCSV(csvPath, updates);
        bot.sendMessage(adminChatID, "CSV updated")
        bot.sendDocument(adminChatID, csvPath)
    }

    if (data.action === 'sheet') {
        bot.sendMessage(adminChatID, "Updating Sheets...")
        const changes = userSession.changes.flowerChanges
        const response = await sheet.get("test31!A:A")
        const rows = response.data.values

        for (const productID in changes) {
            const { newStock } = changes[productID];
            const rowIndex = getRowIndex(rows, productID)
            if (!rowIndex) continue
            await sheet.update(`test31!D${rowIndex}`, [[newStock]])
        }
        bot.sendMessage(adminChatID, "Google Sheets updated")
    }

    console.log(`session after admin handle : ${JSON.stringify(userSession)}`)
}

module.exports = { handleAdminCallback }