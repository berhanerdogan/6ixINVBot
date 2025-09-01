const sessionManager = require('../sessions')
const requestrestock = require('../commands/requestRestock')
const save = require('../commands/save')
const reset = require('../commands/reset')



function handleUserCallback(query, bot) {
    const chatID = query.message.chat.id
    const data = query.data
    const sessions = sessionManager.getSession(chatID);

    switch(data.action) {
        case "prodcut":
            if (sessions) {
                sessions.activeProduct = data.ProductID
                sessions.changes.productChanges[data.ProductID] = { Quantity: data.Quantity }
            }
            bot.sendMessage(chatID, `please enter new value for : ${data.Name}`, {
                reply_markup: { force_reply: true }
            })
            break
        case "flower":
            if (sessions) {
                sessions.activeProduct = data.id
                sessions.changes.flowerChanges[data.id] = { oldStock: data.quantity }
            }
            bot.sendMessage(chatID, `please enter new value: ${data.quantity}`, {
                reply_markup: { force_reply: true }
            })
        case "restock":
            requestrestock(bot)
            break
        case "save":
            save(bot)
            break
        case "reset":
            reset(bot)
            break
            

        
    }




    

    console.log(`session after user handle : ${JSON.stringify(sessions)}`)

}

module.exports = { handleUserCallback }