
const TelegramBot = require("node-telegram-bot-api")
const sheet = require('../sheet');

const TOKEN = "8495027562:AAGxtNKjOhqKXBbSDGfiE2ruV2Ik0e0vDno"

const bot = new TelegramBot(TOKEN, { polling: true })
const sessions = {}

function init() {
    console.log("--- init tg bot ---")

    bot.onText(/\/startsession/, (msg) => {
        if (!sessions[msg.chat.id]) {
            sessions[msg.chat.id] = {
                chatId: msg.chat.id,
                activeProduct: null,
                changes: {},
                startTime: new Date(),
                lastActivity: new Date()
            }
        }

        console.log("new session started")

    });


    bot.onText(/\/getstock$/, async (msg) => {
        try {
            const response = await sheet.get("test31!A:D")
            const values = response.data.values

            const keyboard = values.map(row => {
                const [id, product, stock, count] = row
                return [{
                    text: `${product} | ${stock}`,
                    callback_data: JSON.stringify({ id, stock, product })
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


        let messageText = `User ${chatID} made the following changes:\n`;

        for (const [productID, change] of Object.entries(userSession.changes)) {
            messageText += `Product ${productID}: ${change.oldStock} → ${change.newStock}\n`;
        }

        await bot.sendMessage(adminChatID, messageText, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Approve and sync ✅", callback_data: JSON.stringify({ action: "approve", user: chatID}) },
                        { text: "Dismiss ❌", callback_data: JSON.stringify({ action: "dismiss", user: chatID }) }
                    ],
                    [
                        { text: "Download PDF", callback_data: JSON.stringify({ action: "download", user: chatID }) }]
                ]
            }
        });

    });

    bot.on("callback_query", async (query) => {
        const chatID = query.message.chat.id
        const adminChatID = -4909585957

        if (chatID === adminChatID) {
            handleAdminCallback(query);
        } else {
            handleUserCallback(query);
        }
    })

    bot.on("message", async (msg) => {
        const chatID = msg.chat.id
        if (msg.reply_to_message) {
            const newCount = msg.text.trim()
            const productID = sessions[chatID].activeProduct

            if (!isNaN(newCount)) {
                await bot.sendMessage(chatID, `New stock will be: ${newCount}`)

                if (!sessions[chatID].changes[productID]) {
                    sessions[chatID].changes[productID] = {}
                }
                sessions[chatID].changes[productID].newStock = Number(newCount)
            } else {
                await bot.sendMessage(chatID, "Please enter a number!")
            }
        }
    })

    async function handleAdminCallback(query) {
        const chatID = query.message.chat.id
        const adminChatID = -4909585957
        const data = JSON.parse(query.data)
        const userID = data.user
        const changes = sessions[userID].changes
        bot.sendMessage(adminChatID, "Updating...")
        console.log(changes)
        for (const productID in changes){
            const { oldStock, newStock } = changes[productID];
            const diff = oldStock - newStock;
            const rowIndex = Number(productID) + 1
            await sheet.update(`test31!C${rowIndex}`, [[oldStock]])
            await sheet.update(`test31!D${rowIndex}`, [[newStock]])
            await sheet.update(`test31!E${rowIndex}`, [[diff]])
        }
        bot.sendMessage(adminChatID, "Google Sheets updated please check")
    }

    function handleUserCallback(query) {
        const data = JSON.parse(query.data)
        const chatID = query.message.chat.id

        if (sessions[chatID]) {
            sessions[chatID].activeProduct = data.id
            sessions[chatID].changes[data.id] = { oldStock: data.stock }
        }

        bot.sendMessage(query.message.chat.id, `please enter new value: ${data.stock}`, {
            reply_markup: {
                force_reply: true
            }
        })

    }






}

module.exports = { init };