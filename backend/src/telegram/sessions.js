const sessions = {};

function startSession(chatId) {
    if (!sessions[chatId]) {
        sessions[chatId] = {
            chatId,
            activeProduct: null,
            changes: {
                productChanges: {},
                flowerChanges: {}
            },
            action: null,
            requests: {},       
            startTime: new Date(),
            lastActivity: new Date()
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

function clearSessionActivity(chatId) {
    if (sessions[chatId]) {
        sessions[chatId].changes.productChanges = {}
        sessions[chatId].changes.flowerChanges = {}
        sessions[chatId].action = null
        sessions[chatId].requests = {}

    }
    
}

module.exports = {
    startSession,
    updateLastActivity,
    getSession,
    resetSession,
    clearSessionActivity
};
