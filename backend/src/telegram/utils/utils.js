
function getRowIndex(rows, productID) {
    const idStr = String(productID)
    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === idStr) {
            return i + 1
        }
    }
    return null
}

module.exports = { getRowIndex }