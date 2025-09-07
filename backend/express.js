const ck = require('ckey')
const express = require('express')
const cors = require('cors')
const sheet = require('./src/sheet')
const csv = require('./src/csv')
const path = require('path')
const { init, bot, getChatID } = require('./src/telegram/index')
const sessionManager = require('./src/telegram/sessions');



const app = express()
const PORT = ck.PORT
const TOKEN = ck.TELEGRAM_TOKEN
const ADMIN = ck.ADMIN_CHAT_ID
const chatID = getChatID

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://web.telegram.org',
        'https://t.me'
    ],
    methods: ['GET', 'POST'],
    credentials: true,
}))

app.use(express.json())

app.post(`/bot${TOKEN}`, (req, res) => {
    bot.processUpdate(req.body)
    res.sendStatus(200)
})

app.post("/form", async (req, res) => {
    const formData = req.body
    const session = sessionManager.getSession(chatID)
    session.form = formData


    const form = session.form
    const changedProducts = form.products.filter(p => (p.Quantity && p.Quantity != ""))


    try {
        const text = `*📦 Mismatch Report*
            *Budtender:* ${form.bName}
            *Date:* ${form.date}
            *Shift:* ${form.shift}
            --------------------
            ${changedProducts.map(p => `• ${p.Name}: ${p.Quantity}`).join("\n")}
            --------------------
            *Deposited:* ${form.deposited}
            *Expected:* ${form.expected}
            ---------------------
            *Cash:* ${form.cash}
            *Coin:* ${form.coin}
            *Total:* ${form.total}`
            .split("\n")
            .map(line => line.trim())
            .join("\n")

        await bot.sendMessage(ADMIN, text, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Export as CSV", callback_data: JSON.stringify({ action: "csv", user: chatID }) }
                    ],
                    [
                        { text: "Update Google Sheets", callback_data: JSON.stringify({ action: "sheet", user: chatID }) }
                    ]
                ]
            }
        })

    } catch (error) {
        console.error(error)
    }
    res.json({ ok: true })
})




app.get('/api/all-products', async (req, res) => {
    try {
        const sheetRaw = await sheet.get("test31!A:D")
        const sheetValues = sheetRaw.data.values
        const sheetHeader = sheetValues[0]
        const sheetRows = sheetValues.slice(1)

        const sheetData = sheetRows.map(row => {
            const obj = {};
            sheetHeader.forEach((header, index) => {
                obj[header] = row[index] || ""
            });
            return obj
        })

        const csvData = await csv.getCSV()
        const allData = [...sheetData, ...csvData]
        res.json(allData)
    } catch (error) {
        console.error("Hata detayları:", error.message, error.stack)
        res.status(500).json({ error: 'Sokucam sheets verisine' });
    }
})

app.use(express.static(path.join(__dirname, "../frontend/tgbot_web/dist")))
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/tgbot_web/dist/index.html'))
})




app.listen(PORT, async () => {
    init()
    await sheet.init()
    console.log(PORT)
    console.log(`Server running on port ${PORT}`);
});