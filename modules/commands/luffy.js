const config = require('../../config/config.json');
const logger = require('../../includes/logger');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

module.exports = {
    name: "luffy",
    version: "1.0.1",
    author: "Hridoy",
    description: "Generate an anime Luffy image with your text.",
    adminOnly: false,
    commandCategory: "Fun",
    guide: "Use {pn}luffy <your text> to generate a Luffy image with your message.\nExample: {pn}luffy I will be the Pirate King!",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event, args }) {
        const threadID = event.threadID;
        const messageID = event.messageID;
        const senderID = event.senderID;

        let tempPath = null;

        try {
            if (!event || !threadID || !messageID) {
                logger.error("Invalid event object in luffy command", { event });
                return api.sendMessage(`${config.bot.botName}: ❌ Invalid event data.`, threadID);
            }

            const text = args.join(' ').trim();
            if (!text) {
                logger.warn("No text provided in luffy command");
                api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage(
                    `${config.bot.botName}: ❌ Please provide the text to display in the Luffy image.\nExample: {pn}luffy I will be the Pirate King!`,
                    threadID,
                    messageID
                );
            }

            const userInfo = await new Promise((resolve, reject) => {
                api.getUserInfo([senderID], (err, info) => {
                    if (err) reject(err);
                    else resolve(info);
                });
            });
            const userName = userInfo[senderID]?.name || "Unknown User";

         
            const progressMsgID = await new Promise((resolve) => {
                api.sendMessage(`${config.bot.botName}: 🖼️ Generating your Luffy image...`, threadID, (err, info) => {
                    if (err) resolve(null);
                    else resolve(info.messageID);
                });
            });

        
            const apiUrl = `https://sus-apis.onrender.com/api/anime-text?text=${encodeURIComponent(text)}&topText=${encodeURIComponent(userName)}`;
            logger.info(`Calling Luffy anime-text API: ${apiUrl}`);

        
            const tempDir = path.join(__dirname, '..', '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const fileName = `luffy_${crypto.randomBytes(8).toString('hex')}.png`;
            tempPath = path.join(tempDir, fileName);

     
            const response = await axios.get(apiUrl, { responseType: 'stream', timeout: 20000 });
            if (!response || !response.data || response.status !== 200) {
                throw new Error("Failed to generate the Luffy image.");
            }
            const writer = fs.createWriteStream(tempPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

     
            const imgMsg = {
                body: `${config.bot.botName}: 🏴‍☠️ Here is your Luffy image!`,
                attachment: fs.createReadStream(tempPath)
            };

            await new Promise((resolve, reject) => {
                api.sendMessage(imgMsg, threadID, async (err) => {
                    if (err) return reject(err);
                    api.setMessageReaction("🏴‍☠️", messageID, () => {}, true);
                    if (progressMsgID) {
                        await api.unsendMessage(progressMsgID);
                    }
                    resolve();
                }, messageID);
            });

            logger.info(`Luffy image sent to ${userName} (${senderID})`);
       
            if (tempPath && fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        } catch (err) {
            logger.error(`Error in luffy command: ${err.message}`, { stack: err.stack });
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