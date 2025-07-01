const config = require('../../config/config.json');
const { connect } = require('../../includes/database');
const logger = require('../../includes/logger');

module.exports = {
  name: 'rps',
  version: '1.0.0',
  author: 'Hridoy',
  description: 'Play rock-paper-scissors and bet an amount',
  commandCategory: 'games',
  guide: `{pn}rps ✊/✋/✌️ <amount>\nExample: {pn}rps ✋ 10`,
  cooldowns: 2,
  usePrefix: true,

  async execute({ api, event, args }) {
    let selection, betStr;
    if (args.length === 2) {
      [selection, betStr] = args;
    } else if (args.length === 1) {
      selection = ['✊', '✋', '✌️'][Math.floor(Math.random() * 3)];
      betStr = args[0];
    } else {
      [selection, betStr] = args.join(' ').split(' ');
    }

    const bet = parseInt(betStr);
    const userId = event.senderID;
    const threadID = event.threadID;
    const prefix = config.bot.prefix;

    if (!selection || !['✊', '✋', '✌️'].includes(selection) || isNaN(bet) || bet <= 0) {
      return api.sendMessage(
        `❌ Invalid input!\nUse ${prefix}rps ✊/✋/✌️ <amount>\nExample: ${prefix}rps ✋ 10`,
        threadID
      );
    }

    const db = await connect();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ userId });

    if (!user) {
      return api.sendMessage(`${config.bot.botName}: ⚠️ User not found in database.`, threadID);
    }
    if (user.balance === undefined || user.balance < bet) {
      return api.sendMessage('❌ Insufficient balance!', threadID);
    }

    const choices = ['✊', '✋', '✌️'];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    let result = '';
    let winnings = 0;
    let newBalance = user.balance;

    if (selection === botChoice) {
      result = 'Draw';
      winnings = 0;
    } else if (
      (selection === '✊' && botChoice === '✌️') ||
      (selection === '✋' && botChoice === '✊') ||
      (selection === '✌️' && botChoice === '✋')
    ) {
      result = 'Win';
      winnings = bet * 2;
      newBalance += winnings;
    } else {
      result = 'Lose';
      winnings = -bet;
      newBalance += winnings;
    }

    await usersCollection.updateOne(
      { userId },
      { $set: { balance: newBalance } }
    );

    const statusMsg = result === 'Draw'
      ? 'It\'s a draw! You neither win nor lose.'
      : result === 'Win'
        ? `You win! You get +${winnings} coins.`
        : `You lose! You lose -${bet} coins.`;

    const message =
      `🎮 Rock Paper Scissors 🎮\n\n` +
      `Your choice: ${selection}\n` +
      `Bot choice: ${botChoice}\n` +
      `Bet: ${bet}\n` +
      `Status: ${result}\n` +
      `${statusMsg}\n` +
      `Your new balance: ${newBalance}`;

    api.sendMessage(message, threadID);
  }
};