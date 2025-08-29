const sessionManager = require('../sessions')

function handleUserCallback(query, bot) {
    const chatID = query.message.chat.id
    const data = JSON.parse(query.data)
    const sessions = sessionManager.getSession(chatID);


    if (data.action === 'product') {
        if (sessions) {
            sessions.activeProduct = data.ProductID
            sessions.changes.productChanges[data.ProductID] = { Quantity: data.Quantity }
        }
        console.log(sessions.changes)
        bot.sendMessage(chatID, `please enter new value for : ${data.Name}`, {
            reply_markup: { force_reply: true }
        })
    }

    if (data.action === 'flower') {
        if (sessions) {
            sessions.activeProduct = data.id
            sessions.changes.flowerChanges[data.id] = { oldStock: data.quantity }
        }
        bot.sendMessage(chatID, `please enter new value: ${data.quantity}`, {
            reply_markup: { force_reply: true }
        })
    }

    console.log(`session after user handle : ${JSON.stringify(sessions)}`)

}

module.exports = { handleUserCallback }