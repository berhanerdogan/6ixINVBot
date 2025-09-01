const ck = require('ckey')
const express = require('express')
const cors = require('cors')
const sheet = require('./src/sheet')
const csv = require('./src/csv')
const path = require('path')
const tgBot = require('./telegram')




const app = express()
const PORT = ck.PORT

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://web.telegram.org',
        'https://t.me'
    ],
    methods: ['GET', 'POST'],
    credentials: true,
}))

app.use(express.static(path.join(__dirname, "../frontend/tgbot_web/dist")))
app.get(/(.*)/, (req, res) => {
      res.sendFile(path.join(__dirname, '../frontend/tgbot_web/dist/index.html'))
})


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





app.listen(PORT, async() => {
    tgBot.init()
    console.log(PORT)
    console.log(`Server running on port ${PORT}`);
});