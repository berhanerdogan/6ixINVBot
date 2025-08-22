const tgBot = require('./telegram')
const sheet = require('./sheet')

const start = async () => {
  console.log('--- start ---');
  await sheet.init();

 // test if connect success
  const rs = await sheet.get('test31!A1:B2');
  console.log(rs?.data?.values);
  // finish testing

  tgBot.init();
};

start();