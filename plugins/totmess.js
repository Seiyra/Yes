import fs from 'fs';

const DATA_FILE = './messageCounts.json';

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}));
}

const messageCounts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

export default (message) => {
    const chatId = message.from;
    const sender = message.author || message.from;

    if (!messageCounts[chatId]) {
        messageCounts[chatId] = {};
    }

    if (!messageCounts[chatId][sender]) {
        messageCounts[chatId][sender] = 0;
    }

    messageCounts[chatId][sender] += 1;

    fs.writeFileSync(DATA_FILE, JSON.stringify(messageCounts, null, 2));

    if (message.body === '.totmess') {
        const userMessages = messageCounts[chatId][sender];
        message.reply(`You have sent a total of ${userMessages} messages in this chat.`);
    }
};
