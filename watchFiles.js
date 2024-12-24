const chokidar = require('chokidar');
const chalk = require('chalk');

const watcher = chokidar.watch('.', { 
    ignored: /node_modules|\.git|\.log/, 
    persistent: true 
});

watcher.on('change', path => {
    console.log(chalk.blue(`${path} has been changed`));
});

watcher.on('add', path => {
    console.log(chalk.green(`${path} has been added`));
});

watcher.on('unlink', path => {
    console.log(chalk.red(`${path} has been deleted`));
});
