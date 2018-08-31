require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');
const Axios = require('axios');
const Fs = require('fs');
const Path = require('path');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Europe/Kiev");

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

function saveStudents() {
    Fs.writeFile('students.json', JSON.stringfy(students), {
        encoding: 'utf-8'
    });   
}

function randomElement(source, criteria) {
    let arr;
    if (criteria) {
        arr = [];
        for (let obj of source) {
            let suits = true;
            for (let field in criteria) {
                if (typeof(criteria[field]) === 'function') {
                    if (!criteria[field](obj[field])) {
                        suits = false;
                    }
                } else {
                    if (criteria[field] !== obj[field]) {
                        suits = false;
                    }
                }
            }

            if (suits) {
                arr.push(obj);
            }
        }
        if (arr.length === 0) return null;
    } else {
        arr = source;
    }
    let res = arr[Math.floor(Math.random()*arr.length)];
   
    return res;
}

// Work in progress
function setDuty(msg, match) {
    if (!ADMINS_ID.includes(msg.from.id)) return "Access denied";
    let curDate = moment();

    let stud = randomElement(students, {
        suitable_for_duty: true,
        last_duty: (duty_date) => {
            return true;
        }
    });
    return stud.name;
}


const token = process.env.TELEGRAM_BOT_TOKEN;
const REPLACES_URL = 'http://ccte.nau.edu.ua/images/Zameni.jpg';
const REPLACES_LOCAL_PATH = Path.resolve(__dirname, 'replaces.jpg')
const IDK = 'Sorry, but it\'s just placeholder';
const SCHEDULE = [`Вихідний`,
                  `1. Фіз. вих.\n2. Основи маркетингу\n3. Соціологія\n4. Проектний практикум`, 
                  `1. Інструментальні засоби ВП\n2. Розробка веб-застосувань\n3. Основи маркетингу / Дискретна матем.`, 
                  `1. Охорона праці\n2. Дискретна матем.\n3. Проектний практикум`,
                  `1. Інструментальні засоби ВП\n2. Фіз. вих.\n3. Розробка веб-застосувань`,
                  `1. none \n2. Конструювання ПЗ\n3. Розробка веб-застосувань\n4. Проектний практикум`,
                  `Вихідний`];
const START_TIME = Date.now() / 1000;
const ADMINS_ID = [137307080]; // Feel free to write to me :)
let students = JSON.parse(Fs.readFileSync('students.json', 'utf8'));

console.log(`Bot started at ${moment().format('Do MMMM YYYY HH:mm')}`);

/*
Array of objects with this structure. Suitable only for text responses. 
String -- static response
Array -- randomly choose one of elements
Function -- accepts message and match and should return string
{
    trigger: new RegExp()
    answer: String|Array|Function(msg, match)
}
*/
const staticAnswers = [{
        trigger: /\/cday/im,
        answer: () => {
            return SCHEDULE[moment().day()];
        }
    },
    {
        trigger: /\/nday/im,
        answer: () => {
            let cur_day = moment().day();
            if (cur_day > 3) cur_day = 0;
            return SCHEDULE[cur_day];
        }
    },
    {
        trigger: /\/roll/im,
        answer: () => {
            return randomElement(students).name
        }
    },
    {
        trigger: /\/duty/im,
        answer: setDuty
    }
];

if (require.main === module) {
    const bot = new TelegramBot(token, {polling: true});

    bot.onText(/\/replaces/, async (msg, match) => {
        if (msg.date < START_TIME) return;
        const chatId = msg.chat.id;
        await downloadImage(REPLACES_URL, REPLACES_LOCAL_PATH);
    
        bot.sendPhoto(chatId, REPLACES_LOCAL_PATH, {contentType: 'image/jpeg'});
    });


    for (let obj of staticAnswers) {
        bot.onText(obj.trigger, (msg, match) => {
            if (msg.date < START_TIME) return;
            const chatId = msg.chat.id;
            let answer;
    
            if (typeof(obj.answer) === 'string') {
                answer = obj.answer;
            } else if (Array.isArray(obj.answer)) {
                answer = randomElement(obj.answer);
            } else if (typeof(obj.answer) === 'function') {
                answer = obj.answer(msg, match);
            } else {
                throw Error('incorrect type of "answer"');
            }
    
            bot.sendMessage(chatId, answer);
        })
    }
}
module.exports = {
    randomElement: randomElement
}