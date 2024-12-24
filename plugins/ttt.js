const games = new Map();

export default (message, client) => {
    const chatId = message.from;
    const text = message.body.toLowerCase();
    const player = message.from;

    if (text.startsWith('.ttt')) {
        const mode = text.split(' ')[2];
        if (games.has(chatId)) {
            message.reply("⚠️ There's already an ongoing game! Use 'show board' to view it.");
            return;
        }

        if (!['pvp', 'pvb'].includes(mode)) {
            message.reply("❌ Invalid mode! Use 'start ttt pvp' to play with someone or 'start ttt pvb' to play against the bot.");
            return;
        }

        const board = Array(9).fill(' ');
        const game = { 
            board, 
            currentPlayer: 'X', 
            mode,
            player,
        };
        games.set(chatId, game);

        message.reply(`🎮 Tic-Tac-Toe (${mode.toUpperCase()}) started! You are '❌'. Use 'play <1-9>' to make your move.\n\n` + renderBoard(board));
        return;
    }

    if (text === 'show board') {
        if (!games.has(chatId)) {
            message.reply("❌ No ongoing game. Use 'start ttt pvp' or 'start ttt pvb' to begin.");
            return;
        }

        const { board } = games.get(chatId);
        message.reply("📋 Current board:\n\n" + renderBoard(board));
        return;
    }

    if (text.startsWith('play ')) {
        if (!games.has(chatId)) {
            message.reply("❌ No ongoing game. Use 'start ttt pvp' or 'start ttt pvb' to begin.");
            return;
        }

        const game = games.get(chatId);
        const { board, currentPlayer, mode, player } = game;

        // Check if the player trying to make a move is the one who started the game
        if (message.from !== player) {
            message.reply("🚫 It's not your turn or this isn't your game!");
            return;
        }

        const position = parseInt(text.split(' ')[1], 10) - 1;

        if (isNaN(position) || position < 0 || position > 8) {
            message.reply("❌ Invalid move! Use a number between 1 and 9.");
            return;
        }

        if (board[position] !== ' ') {
            message.reply("❌ That spot is already taken! Choose another.");
            return;
        }

        board[position] = currentPlayer;
        const winner = checkWinner(board);

        if (winner) {
            message.reply(renderBoard(board) + `\n🎉 Player '${winner}' wins!`);
            games.delete(chatId);
            return;
        }

        if (board.every((cell) => cell !== ' ')) {
            message.reply(renderBoard(board) + "\n🤝 It's a draw!");
            games.delete(chatId);
            return;
        }

        if (mode === 'pvb' && currentPlayer === 'X') {
            const botMove = botChooseMove(board);
            board[botMove] = 'O';
            const botWinner = checkWinner(board);

            if (botWinner) {
                message.reply(renderBoard(board) + `\n🤖 Bot ('${botWinner}') wins!`);
                games.delete(chatId);
                return;
            }

            if (board.every((cell) => cell !== ' ')) {
                message.reply(renderBoard(board) + "\n🤝 It's a draw!");
                games.delete(chatId);
                return;
            }

            game.currentPlayer = 'X';
            message.reply(renderBoard(board) + `\n🔄 It's now your turn, player '❌'!`);
        } else {
            game.currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            const nextPlayer = game.currentPlayer === 'X' ? player : game.player;
            message.reply(renderBoard(board) + `\n🔄 It's now @${nextPlayer}'s turn!`);
        }
        return;
    }

    if (text === 'end ttt') {
        if (!games.has(chatId)) {
            message.reply("❌ No ongoing game to end.");
            return;
        }

        games.delete(chatId);
        message.reply("🛑 Game ended! Use 'start ttt pvp' or 'start ttt pvb' to play again.");
    }
};

function renderBoard(board) {
    return `
${formatCell(board[0])} | ${formatCell(board[1])} | ${formatCell(board[2])}
---------
${formatCell(board[3])} | ${formatCell(board[4])} | ${formatCell(board[5])}
---------
${formatCell(board[6])} | ${formatCell(board[7])} | ${formatCell(board[8])}
    `;
}

function formatCell(cell) {
    return cell === ' ' ? '⬜' : cell === 'X' ? '❌' : '⭕';
}

function checkWinner(board) {
    const winningCombos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] !== ' ' && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function botChooseMove(board) {
    const emptySpots = board.map((val, idx) => (val === ' ' ? idx : null)).filter((val) => val !== null);
    return emptySpots[Math.floor(Math.random() * emptySpots.length)];
}
