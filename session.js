const fs = require('fs');
const path = require('path');

module.exports.handleMessage = async (client, message) => {
  // Check if the message is a command
  if (message.body === '!help') {
    message.reply('Here are the commands:\n!echo <text> - Echo your message\n!greet - Greet the bot');
  } else {
    // Handle commands from plugins
    if (message.body.startsWith('!')) {
      const pluginCommand = message.body.split(' ')[0].substring(1);
      const plugin = require(`./plugins/${pluginCommand}`);
      if (plugin) {
        await plugin.execute(client, message);
      }
    }
  }
};
