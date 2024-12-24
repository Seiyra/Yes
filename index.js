import qrcode from 'qrcode-terminal';
import whatsappWeb from 'whatsapp-web.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client, LocalAuth } = whatsappWeb; 

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './session' 
    })
});

const participantsFilePath = path.join(__dirname, 'participants.json');

const loadParticipants = () => {
    if (fs.existsSync(participantsFilePath)) {
        const data = fs.readFileSync(participantsFilePath);
        return JSON.parse(data);
    }
    return { joined: [], left: [] };
};

const saveParticipants = (participants) => {
    fs.writeFileSync(participantsFilePath, JSON.stringify(participants, null, 2));
};

client.on('qr', (qr) => {
    console.log('Scan this QR code with WhatsApp:');
    qrcode.generate(qr, { small: true }); 
});

client.on('ready', async () => {
    console.log('WhatsApp Web is now ready!');
    const botNumber = client.info.wid._serialized; 
    console.log(`Bot Number: ${botNumber}`);
    loadPlugins();
});

client.on('message', async (message) => {
    const senderNumber = message.from.includes('@g.us') 
        ? message.author 
        : message.from;  
    const groupName = message.from.includes('@g.us') 
        ? (await message.getChat()).name 
        : 'Direct Message'; 

    console.log('-----------------------------');
    console.log(`Group: ${groupName}`);
    console.log(`Sender: ${senderNumber}`);
    console.log(`Message: ${message.body}`);
    console.log('-----------------------------');
});

const loadPlugins = () => {
    const pluginFolder = path.join(__dirname, 'plugins');
    const plugins = fs.readdirSync(pluginFolder);

    plugins.forEach(async (pluginFile) => {
        const pluginPath = path.join(pluginFolder, pluginFile);

        try {
            const plugin = await import(`file://${pluginPath}`); 
            console.log(`Loaded plugin: ${pluginFile}`);

            client.on('message', (message) => {
                try {
                    plugin.default(message, client); 
                } catch (err) {
                    console.error(`Error in plugin ${pluginFile}:`, err.message);
                }
            });
        } catch (err) {
            console.error(`Failed to load plugin ${pluginFile}:`, err.message);
        }
    });

    console.log('All plugins loaded.');
};

fs.watch(path.join(__dirname, 'plugins'), (eventType, filename) => {
    if (filename) {
        console.log(`Detected change in plugin: ${filename}`);
        loadPlugins();
    }
});

client.on('group_join', async (notification) => {
    try {
        console.log('Group Join Notification:', notification);
        const participants = loadParticipants(); 
        const newParticipant = notification.id.participant;

        if (newParticipant && !participants.joined.includes(newParticipant)) {
            const group = await client.getChatById(notification.chatId);
            const greetingMessage = `Welcome to the group, @${newParticipant}!`;
            await group.sendMessage(greetingMessage);

            participants.joined.push(newParticipant);
            saveParticipants(participants);
        } else {
            console.log(`Participant @${newParticipant} already greeted.`);
        }
    } catch (error) {
        console.error('Error while sending greeting:', error);
    }
});

client.on('group_leave', async (notification) => {
    try {
        console.log('Group Leave Notification:', notification);
        
        const leftParticipant = notification.id.participant;
        
        const participants = loadParticipants(); 

        if (leftParticipant && participants.joined.includes(leftParticipant)) {
            const group = await client.getChatById(notification.chatId);
            const goodbyeMessage = `Goodbye @${leftParticipant}, we'll miss you!`;
            await group.sendMessage(goodbyeMessage);

            participants.joined = participants.joined.filter(p => p !== leftParticipant);
            participants.left.push(leftParticipant);
            saveParticipants(participants);
        } else {
            console.log(`Participant @${leftParticipant} not found in joined list.`);
        }
    } catch (error) {
        console.error('Error while sending goodbye:', error);
    }
});

client.initialize();

setInterval(() => {}, 1000);