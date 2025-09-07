const { requestRestock } = require('../commands/requestRestock')
const { reset } = require('../commands/reset')

function handleUserCallback(query, bot, chatID) {
    const data = query.data

    switch(data) {
        case "restock":
            requestRestock(bot, chatID)
            break
        case "reset":
            reset(bot, chatID)
            break

    }
}

module.exports = { handleUserCallback }