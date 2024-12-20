const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// Initialize the express app
const app = express();
const port = 3000;

// Path for storing session data
const sessionFolder = path.join(__dirname, 'session');
const sessionFile = path.join(sessionFolder, 'session.json');

// Create session folder if it doesn't exist
if (!fs.existsSync(sessionFolder)) {
  fs.mkdirSync(sessionFolder);
}

let client;

// If session data exists, load it; otherwise, create a new client
if (fs.existsSync(sessionFile)) {
  client = new Client({
    puppeteer: { headless: true },
    session: JSON.parse(fs.readFileSync(sessionFile, 'utf-8')),
  });
} else {
  client = new Client({
    puppeteer: { headless: true },
  });
}

// Serve the QR code for authentication
client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('Scan the QR code to authenticate.');
});

// Save session data after successful authentication
client.on('authenticated', (sessionData) => {
  fs.writeFileSync(sessionFile, JSON.stringify(sessionData));
  console.log('Authenticated successfully!');
});

// Start the bot when it is ready
client.on('ready', () => {
  console.log('Bot is online and ready!');
});

// Listen for incoming messages
client.on('message', (message) => {
  console.log('Received message:', message.body);
});

// Initialize the WhatsApp client
client.initialize();

// Set up Express routes
app.get('/', (req, res) => {
  res.send('WhatsApp bot server is running!');
});

// Route to get the status of the bot
app.get('/status', (req, res) => {
  if (client.info) {
    res.json({
      status: 'connected',
      username: client.info.pushname,
    });
  } else {
    res.json({ status: 'disconnected' });
  }
});

// Route to trigger sending a message (example)
app.post('/send-message', express.json(), (req, res) => {
  const { phoneNumber, messageText } = req.body;

  if (!phoneNumber || !messageText) {
    return res.status(400).send('Missing phoneNumber or messageText');
  }

  const number = phoneNumber.includes('@c.us') ? phoneNumber : `${phoneNumber}@c.us`;

  client.sendMessage(number, messageText)
    .then(() => {
      res.send('Message sent!');
    })
    .catch((err) => {
      console.error('Error sending message:', err);
      res.status(500).send('Error sending message');
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
