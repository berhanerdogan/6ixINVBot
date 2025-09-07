exports.help = async (bot, chatID) => {
    const helpMsg = `
        👋 Welcome to 6ixINVBot!  
        This bot helps you track inventory mismatches and request a restock.

        📝 *Start a Count*  
        This button will open a counting screen.  
        1️⃣ On the first page, fill in the required fields.  
        2️⃣ On the second page, you'll see the product list with current stock numbers. Count the products yourself, and if there's a mismatch, click the product name and enter your counted number.  
        ❗ Please do not click save until you finish counting all products.  
        3️⃣ On the last screen, enter the amount of money in the register and click save.  
        ✅ You will receive a Telegram message confirming your report has been sent to the admin.

        📦 *Request Restock*  
        This button automatically sends a message to the admin with all products that have less than 6 items in stock.

        🔄 *Reset*  
        This button will reset your session.
        `

    await bot.sendMessage(chatID, helpMsg, { parse_mode: "Markdown" })

}