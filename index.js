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
const REPLACES_LOCAL_PATH = Path.resolve(__dirname, 'replaces.jpg');
const IDK = 'Sorry, but it\'s just placeholder';
const SCHEDULE = [`Вихідний`, // 0 - Sun
                  `1. Економіка / Психологія\n2. Комп. графіка\n3. Дискр. математика`, // 1 - Mon
                  `1. Конструювання ПЗ\n2. Економіка\n3. Дискр. математика`, // 2 - Tue
                  `1. Психологія\n2. Комп. графіка\n3. Дискр. математика`, // 3 - Wed
                  `1. Конструювання ПЗ\n2. Людинно-машинний інтерфейс  / Філософія\n3. Філософія`, // 4 - Thu
                  `1. Економіка\n2. Людинно-машинний інтерфейс\n3. Правознавство`, // 5 - Fri
                  `Вихідний`]; // 6 - Sat
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
            if (cur_day > 4 || cur_day === 0) cur_day = 1;
            else cur_day++;
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