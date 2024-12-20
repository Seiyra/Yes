module.exports.execute = async (client, message) => {
    const text = message.body.slice(6);  // Remove the command prefix '!echo'
    if (text) {
      message.reply(text);
    } else {
      message.reply('Please provide text to echo!');
    }
  };
  