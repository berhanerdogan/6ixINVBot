const ck = require('ckey')
const fs = require('fs')
const csv = require('csv-parser')
const { stringify } = require('csv-stringify');

const csvPath = ck.CSV_PATH



exports.getCSV = async () => {
    return new Promise((resolve, reject) => {
        const results = []
        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error))
    })
}

exports.updateCSV = (file, productID, newCount) => {
    return file.map(p => {
        if (p.ProductID === productID) {
            return { ...p, Quantity: newCount }
        }
        return p
    })

}

exports.writeCSV = (filePath, records) => {
    return new Promise((resolve, reject) => {
        stringify(records, { header: true }, (err, output) => {
            if (err) return reject(err)
            fs.writeFile(filePath, output, (err) => {
                if (err) return reject(err)
                resolve()
            })
        })
    })
}
