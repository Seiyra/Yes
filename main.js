module.exports = (client) => {
    console.log('Bot is running...');
  
    // Handle group participant events (join/leave)
    client.on('group_participants', (event) => {
      const { groupId, participants, action } = event;
  
      // Handle people who join
      if (action === 'add') {
        participants.forEach((participant) => {
          const name = participant.split('@')[0]; // Extract the participant's name
          client.sendMessage(groupId, `Welcome ${name}! 👋🏻 We're happy to have you in the group!`);
        });
      }
  
      // Handle people who leave
      if (action === 'remove') {
        participants.forEach((participant) => {
          const name = participant.split('@')[0]; // Extract the participant's name
          client.sendMessage(groupId, `Goodbye ${name}. We'll miss you! 👋🏻`);
        });
      }
    });
  
    // Here you can add more bot features like handling messages, sending automated replies, etc.
    client.on('message', (message) => {
      console.log('Received message:', message.body);
      // Add any message handling logic here
    });
  };
  