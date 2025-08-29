require('dotenv').config();
const express = require('express')
const cors = require('cors')
const sheet = require('./src/sheet')
const csv = require('./src/csv')


const app = express()
const PORT = 4000

app.use(cors({
    origin:'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
}))

app.use(express.json())


app.get('/api/all-products', async (req, res) =>{
    try {
        const response = await sheet.get("test31!A:D")
        const values = response.data.values

        const csvData = await csv.getCSV()

        const allData = [...values, ...csvData]
        console.log(allData)
        res.json(allData)
    } catch (error) {
        console.error("Hata detayları:", error.message, error.stack)
        res.status(500).json({ error: 'Sheets verisi alınamadı' });
    }
})


app.listen(PORT, async() => {
    await sheet.init();
    console.log(`Server running on port ${PORT}`);
});