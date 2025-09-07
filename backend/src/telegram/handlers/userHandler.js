const { requestRestock } = require('../commands/requestRestock')
const reset = require('../commands/reset')



function handleUserCallback(query, bot) {
    const data = query.data

    switch(data) {
        case "restock":
            requestRestock(bot)
            break
        case "reset":
            reset(bot)
            break

    }
}

module.exports = { handleUserCallback }