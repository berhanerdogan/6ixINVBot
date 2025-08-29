
const tgBot = require('./telegram')
const sheet = require('./sheet')

const start = async () => {
  await sheet.init();
  tgBot.init();
  console.log('--- start ---');
};

start();