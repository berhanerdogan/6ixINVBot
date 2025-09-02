const ck = require('ckey')
const express = require('express')
const cors = require('cors')
const sheet = require('./src/sheet')
const csv = require('./src/csv')
const path = require('path')
const tgBot = require('./src/telegram')




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



app.get('/api/all-products', async (req, res) =>{
    try {

        
        const csvData = await csv.getCSV()
        res.json(csvData)
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
    tgBot.init()
    console.log(PORT)
    console.log(`Server running on port ${PORT}`);
});