const config = require('../../config/config.json');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const logger = require('../../includes/logger');

module.exports = {
    name: "cvo",
    version: "1.0.0",
    author: "Hridoy",
    description: "Generate a Crying vs Okay emoji meme image with your texts.",
    adminOnly: false,
    commandCategory: "Fun",
    guide: "Use {pn}cvo <text 1> | <text 2> to generate a Crying vs Okay meme.\nExample: {pn}cvo When you have to wake up early | When you remember it's weekend",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event, args }) {
        const threadID = event.threadID;
        const messageID = event.messageID;
        const senderID = event.senderID;

        let tempPath = null;

        try {
            if (!event || !threadID || !messageID) {
                logger.error("Invalid event object in cvo command", { event });
                return api.sendMessage(`${config.bot.botName}: ❌ Invalid event data.`, threadID);
            }

            const content = args.join(' ').trim();
            const split = content.split('|');
            if (split.length < 2) {
                logger.warn("Not enough text provided in cvo command");
                api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage(
                    `${config.bot.botName}: ❌ Please provide two texts separated by '|'.\nExample: {pn}cvo When you have to wake up early | When you remember it's weekend`,
                    threadID,
                    messageID
                );
            }
            const text1 = split[0].trim();
            const text2 = split.slice(1).join('|').trim();

        
            const progressMsgID = await new Promise((resolve) => {
                api.sendMessage(`${config.bot.botName}: 🖼️ Generating CVO meme image...`, threadID, (err, info) => {
                    if (err) resolve(null);
                    else resolve(info.messageID);
                });
            });

  
            const apiUrl = `https://sus-apis.onrender.com/api/crying-vs-okay-emoji?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;
            logger.info(`Calling CVO meme API: ${apiUrl}`);

   
            const tempDir = path.join(__dirname, '..', '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const fileName = `cvo_${crypto.randomBytes(8).toString('hex')}.png`;
            tempPath = path.join(tempDir, fileName);

            const response = await axios.get(apiUrl, { responseType: 'stream', timeout: 20000 });
            if (!response || !response.data || response.status !== 200) {
                throw new Error("Failed to generate the CVO meme image.");
            }
            const writer = fs.createWriteStream(tempPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

   
            const imgMsg = {
                body: `${config.bot.botName}: 😭🙂 Here is your Crying vs Okay meme image!`,
                attachment: fs.createReadStream(tempPath)
            };

            await new Promise((resolve, reject) => {
                api.sendMessage(imgMsg, threadID, async (err) => {
                    if (err) return reject(err);
                    api.setMessageReaction("😭", messageID, () => {}, true);
                    if (progressMsgID) {
                        await api.unsendMessage(progressMsgID);
                    }
                    resolve();
                }, messageID);
            });

            logger.info(`CVO meme image sent to ${senderID}`);
       
            if (tempPath && fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        } catch (err) {
            logger.error(`Error in cvo command: ${err.message}`, { stack: err.stack });
            api.setMessageReaction("❌", messageID, () => {}, true);
            await api.sendMessage(
                `${config.bot.botName}: ⚠️ Error: ${err.message}`,
                event.threadID,
                event.messageID
            );
            if (tempPath && fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        }
    }
};