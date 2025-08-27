const TelegramBot = require("node-telegram-bot-api")
const sheet = require('../sheet');
const csv = require('../csv')

const TOKEN = "8495027562:AAGxtNKjOhqKXBbSDGfiE2ruV2Ik0e0vDno"

const bot = new TelegramBot(TOKEN, { polling: true })
const sessions = {}

function init() {

    bot.onText(/\/getstock$/, async (msg) => {
        sessions[msg.chat.id].changes.productChanges = {}
        startSession(msg)

        try {
            const results = await csv.getCSV()
            const keyboard = results.map(p => ([{
                text: `${p.Name} | ${p.Quantity}`,
                callback_data: JSON.stringify({ action: 'product', ProductID: p.ProductID, Quantity: p.Quantity })
            }]))
            bot.sendMessage(msg.chat.id, "Products:", {
                reply_markup: { inline_keyboard: keyboard }
            })
        } catch (error) {
            bot.sendMessage(msg.chat.id, "Cannot get the sheet")
        }
    })

    bot.onText(/\/getflowerstock$/, async (msg) => {
        sessions[msg.chat.id].changes.flowerChanges = {}
        startSession(msg)

        try {
            const response = await sheet.get("test31!A:D")
            const values = response.data.values
            const keyboard = values.map(row => {
                const [id, sku, name, quantity] = row
                return [{
                    text: `${name} | ${quantity}`,
                    callback_data: JSON.stringify({ action: 'flower', id, quantity})
                }]
            })
            bot.sendMessage(msg.chat.id, "Products:", {
                reply_markup: { inline_keyboard: keyboard }
            })
        } catch (error) {
            bot.sendMessage(msg.chat.id, "Cannot get the sheet")
        }
    })

    bot.onText(/\/save/, async (msg) => {
        const chatID = msg.chat.id
        const adminChatID = -4909585957
        const userSession = sessions[chatID]

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
        });
    });

    bot.on("callback_query", async (query) => {
        startSession(query.message)
        const chatID = query.message.chat.id
        const adminChatID = -4909585957
        const data = JSON.parse(query.data)
        sessions[chatID].action = data.action

        if (chatID === adminChatID) {
            handleAdminCallback(query);
        } else {
            handleUserCallback(query);
        }
    })

    bot.on("message", async (msg) => {
        startSession(msg)
        const chatID = msg.chat.id
        const action = sessions[chatID].action
        if (msg.reply_to_message) {
            const newCount = msg.text.trim()
            const productID = sessions[chatID].activeProduct

            if (!isNaN(newCount)) {
                await bot.sendMessage(chatID, `New stock will be: ${newCount}`)
                if (action === "product") {
                    if (!sessions[chatID].changes.productChanges[productID]) sessions[chatID].changes.productChanges[productID] = {}
                    sessions[chatID].changes.productChanges[productID].newStock = Number(newCount)
                } else if (action === "flower") {
                    if (!sessions[chatID].changes.flowerChanges[productID]) sessions[chatID].changes.flowerChanges[productID] = {}
                    sessions[chatID].changes.flowerChanges[productID].newStock = Number(newCount)
                }
            } else {
                await bot.sendMessage(chatID, "Please enter a number!")
            }
        }
    })

    async function handleAdminCallback(query) {
        const data = JSON.parse(query.data)
        const userID = data.user
        const adminChatID = -4909585957
        const userSession = sessions[userID]
        const csvFile = await csv.getCSV()
        const csvPath = '/Users/berhan/projects/TGbot/src/telegram/sample.csv'

        if (!userSession) return bot.sendMessage(adminChatID, `No session found for user ${userID}`);

        if (data.action === 'csv') {
            bot.sendMessage(adminChatID, "Updating CSV...")
            let updates = csvFile
            for (const [productID, change] of Object.entries(userSession.changes.productChanges)) {
                updates = csv.updateCSV(updates, productID, change.newStock);
            }
            await csv.writeCSV(csvPath, updates);
            bot.sendMessage(adminChatID, "CSV updated")
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
    }

    function handleUserCallback(query) {
        const chatID = query.message.chat.id
        const data = JSON.parse(query.data)

        if (data.action === 'product') {
            if (sessions[chatID]) {
                sessions[chatID].activeProduct = data.ProductID
                sessions[chatID].changes.productChanges[data.ProductID] = { Quantity: data.Quantity }
            }
            bot.sendMessage(chatID, `please enter new value for : ${data.Name}`, {
                reply_markup: { force_reply: true }
            })
        }

        if (data.action === 'flower') {
            if (sessions[chatID]) {
                sessions[chatID].activeProduct = data.id
                sessions[chatID].changes.flowerChanges[data.id] = { oldStock: data.quantity }
            }
            bot.sendMessage(chatID, `please enter new value: ${data.quantity}`, {
                reply_markup: { force_reply: true }
            })
        }
    }

    function startSession(msg) {
        if (!sessions[msg.chat.id]) {
            sessions[msg.chat.id] = {
                chatId: msg.chat.id,
                activeProduct: null,
                changes: {
                    flowerChanges: {},
                    productChanges: {}
                },
                startTime: new Date(),
                lastActivity: new Date()
            }
        }
    }

    function getRowIndex(rows, productID) {
        const idStr = String(productID)
        for (let i = 1; i < rows.length; i++){
            if (String(rows[i][0]) === idStr){
                return i + 1
            }
        }
        return null
    }

}

module.exports = { init };
