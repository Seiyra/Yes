const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const main = require('./main');
const session = require('./session');

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
  main(client);  // Initialize main logic after bot is ready
});

// Listen for incoming messages (you can handle messages here too)
client.on('message', (message) => {
  console.log('Received message:', message.body);
});

// Initialize the WhatsApp client
client.initialize();

// Set up Express routes
const express = require('express');
const app = express();
const port = 3000;

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

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
