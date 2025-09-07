const sessionManager = require('../sessions')
const requestrestock = require('../commands/requestRestock')
const reset = require('../commands/reset')



function handleUserCallback(query, bot) {
    const chatID = query.message.chat.id
    const data = query.data

    switch(data) {
        case "restock":
            console.log("restock requested")
            requestrestock(bot)
            break
        case "reset":
            reset(bot)
            break

    }
}

module.exports = { handleUserCallback }