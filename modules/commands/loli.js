const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const logger = require('../../includes/logger');

module.exports = {
    name: "loli",
    version: "1.0.0",
    author: "Hridoy",
    description: "Send a random loli anime image.",
    adminOnly: false,
    commandCategory: "Fun",
    guide: "Use {pn}loli to get a random loli anime image.",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event, args }) {
        const threadID = event.threadID;
        const messageID = event.messageID;

        let tempPath = null;

        try {
  
            const progressMsgID = await new Promise((resolve) => {
                api.sendMessage("⏳ Fetching loli for you...", threadID, (err, info) => {
                    if (err) resolve(null);
                    else resolve(info.messageID);
                });
            });

       
            const apiUrl = "https://sus-apis.onrender.com/api/loli";
            const response = await axios.get(apiUrl, { responseType: "stream", timeout: 20000 });
            if (!response || !response.data || response.status !== 200) {
                throw new Error("Failed to fetch loli image.");
            }

            const tempDir = path.join(__dirname, '..', '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const fileName = `loli_${crypto.randomBytes(8).toString('hex')}.jpg`;
            tempPath = path.join(tempDir, fileName);

            const writer = fs.createWriteStream(tempPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const imgMsg = {
                body: "🩷 Here is your random loli anime image!",
                attachment: fs.createReadStream(tempPath)
            };

            await new Promise((resolve, reject) => {
                api.sendMessage(imgMsg, threadID, async (err) => {
                    if (err) return reject(err);
                    api.setMessageReaction("🩷", messageID, () => {}, true);
                    if (progressMsgID) {
                        await api.unsendMessage(progressMsgID);
                    }
                    resolve();
                }, messageID);
            });

            logger.info(`[loli Command] Loli image sent to ${event.senderID}`);

            if (tempPath && fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        } catch (err) {
            logger.error(`Error in loli command: ${err.message}`, { stack: err.stack });
            api.setMessageReaction("❌", messageID, () => {}, true);
            await api.sendMessage(
                `⚠️ Error: ${err.message}`,
                threadID,
                messageID
            );
            if (tempPath && fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        }
    }
};