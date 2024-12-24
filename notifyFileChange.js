const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const folderToWatch = path.join(__dirname, 'plugins');
fs.watch(folderToWatch, (eventType, filename) => {
    if (filename && eventType === 'change') {
        console.log(chalk.blue(`${filename} has been changed.`));
    }
});
