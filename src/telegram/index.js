
const TelegramBot = require("node-telegram-bot-api")
const sheet = require('../sheet');
const csv = require('../csv')

const TOKEN = "8495027562:AAGxtNKjOhqKXBbSDGfiE2ruV2Ik0e0vDno"

const bot = new TelegramBot(TOKEN, { polling: true })
const sessions = {}

function init() {
    console.log("--- init tg bot ---")

    bot.onText(/\/getstock$/, async (msg) => {
        sessions[msg.chat.id].changes.productChanges = {}
        startSession(msg)

        try {
            const results = await csv.getCSV()
            const keyboard = results.map(p => ([{
                text: `${p.Name} | ${p.Quantity}`,
                callback_data: JSON.stringify({ action: 'product', ProductID: p.ProductID, Quantity: p.Quantity })
            }]))
            bot.sendMessage(msg.chat.id, "Products:     ", {
                reply_markup: { inline_keyboard: keyboard }
            })
        } catch (error) {
            console.error("sheets error", error)
            bot.sendMessage(msg.chat.id, "Tabloya yok sikmisler olmus");
        }
    })

    bot.onText(/\/getflowerstock$/, async (msg) => {
        sessions[msg.chat.id].changes.flowerChanges = {}
        startSession(msg)

        try {
            const response = await sheet.get("test31!A:D")
            const values = response.data.values

            const keyboard = values.map(row => {
                const [id, product, last_count, stock] = row
                return [{
                    text: `${product} | ${stock}`,
                    callback_data: JSON.stringify({ action: 'flower', id, stock })
                    // pass an ID with callback_data, write a function that gets the id from the sheet
                    // to overcome the data size problem
                }]
            })

            bot.sendMessage(msg.chat.id, "Products:     ", {
                reply_markup: { inline_keyboard: keyboard }
            })

        } catch (error) {
            console.error("sheets error", error)
            bot.sendMessage(msg.chat.id, "Tabloya yok sikmisler olmus");
        }
    })

    bot.onText(/\/save/, async (msg) => {
        const chatID = msg.chat.id
        const adminChatID = -4909585957
        const userSession = sessions[chatID]
        console.log(userSession)


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
                    sessions[chatID].action = 'product'
                    sessions[chatID].changes.productChanges[productID].newStock = Number(newCount)
                } else if (action === "flower") {
                    if (!sessions[chatID].changes.flowerChanges[productID]) sessions[chatID].changes.flowerChanges[productID] = {}
                    sessions[chatID].action = 'flower'
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

        if (data.action === 'csv') {
            let updates = csvFile
            bot.sendMessage(adminChatID, "Updating csv...")
            for (const [productID, change] of Object.entries(userSession.changes.productChanges)) {
                updates = csv.updateCSV(updates, productID, change.newStock);
            }
            await csv.writeCSV(csvPath, updates);
            bot.sendMessage(adminChatID, "CSV updated please check")
        }

        if (data.action === 'sheet') {
            const changes = sessions[userID].changes.flowerChanges
            bot.sendMessage(adminChatID, "Updating sheets...")
            console.log(changes)
            for (const productID in changes) {
                const { oldStock, newStock } = changes[productID];
                const diff = oldStock - newStock;
                const rowIndex = Number(productID) + 1
                await sheet.update(`test31!C${rowIndex}`, [[oldStock]])
                await sheet.update(`test31!D${rowIndex}`, [[newStock]])
                await sheet.update(`test31!E${rowIndex}`, [[diff]])
            }
            bot.sendMessage(adminChatID, "Google Sheets updated please check")
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

            bot.sendMessage(query.message.chat.id, `please enter new value for : ${data.Name}`, {
                reply_markup: {
                    force_reply: true
                }
            })
        }

        if (data.action === 'flower') {
            if (sessions[chatID]) {
                sessions[chatID].activeProduct = data.id
                sessions[chatID].changes.flowerChanges[data.id] = { oldStock: data.stock }
            }

            bot.sendMessage(query.message.chat.id, `please enter new value: ${data.stock}`, {
                reply_markup: {
                    force_reply: true
                }
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
            console.log("new session started")
        } else {
            console.log("no need for new session, kept the current")
        }

    }
}

module.exports = { init };