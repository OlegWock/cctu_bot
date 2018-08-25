require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');
const Axios = require('axios');
const Fs = require('fs')  
const Path = require('path')  


async function downloadImage(url, path) {
    const response = await Axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
    });

  
    response.data.pipe(Fs.createWriteStream(path));

  
    return new Promise((resolve, reject) => {
        response.data.on('end', () => {
            resolve();
        });

        response.data.on('error', () => {
            reject();
        });
  });
}

const token = process.env.TELEGRAM_BOT_TOKEN;
const REPLACES_URL = 'http://ccte.nau.edu.ua/images/Zameni.jpg';
const REPLACES_LOCAL_PATH = Path.resolve(__dirname, 'replaces.jpg')
const IDK = 'Sorry, but it\'s just placeholder';

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/replaces/, async (msg, match) => {
    const chatId = msg.chat.id;
    await downloadImage(REPLACES_URL, REPLACES_LOCAL_PATH);

    bot.sendPhoto(chatId, REPLACES_LOCAL_PATH, {contentType: 'image/jpeg'});
});

bot.onText(/\/cday/, (msg, match) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, IDK);
});

bot.onText(/\/nday/, (msg, match) => {
    const chatId = msg.chat.id;
 

    bot.sendMessage(chatId, IDK);
});