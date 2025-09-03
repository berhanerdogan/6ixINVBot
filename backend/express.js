const ck = require('ckey')
const express = require('express')
const cors = require('cors')
const sheet = require('./src/sheet')
const csv = require('./src/csv')
const path = require('path')
const { init, bot } = require('./src/telegram/index')


const app = express()
const PORT = ck.PORT
const TOKEN = ck.TELEGRAM_TOKEN

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

app.post("/send", async (req, res) => {
  try {
    const data = req.body
    const text = `📦 Form Data:\n${JSON.stringify(data, null, 2)}`;

    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: ck.ADMIN_CHAT_ID, text }),
    });

    res.json({ ok: true, sentToTelegram: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Error accured while sending the message" });
  }
});




app.get('/api/all-products', async (req, res) =>{
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




app.listen(PORT, async() => {
    init()
    await sheet.init()
    console.log(PORT)
    console.log(`Server running on port ${PORT}`);
});