const sessions = {};

function startSession(chatId) {
    if (!sessions[chatId]) {
        sessions[chatId] = {
            chatId,
            activeProduct: null,
            action: null,
            requests: {},       
            startTime: new Date(),
            lastActivity: new Date(),
            form: {}
        };
    }
    return sessions[chatId];
}

function updateLastActivity(chatId) {
    if (sessions[chatId]) {
        sessions[chatId].lastActivity = new Date();
    }
}

function getSession(chatId) {
    return sessions[chatId] || startSession(chatId);
}

function resetSession(chatId) {
    if (sessions[chatId]) {
        delete sessions[chatId]
        startSession(chatId)
    }
}


module.exports = {
    startSession,
    updateLastActivity,
    getSession,
    resetSession,
}
