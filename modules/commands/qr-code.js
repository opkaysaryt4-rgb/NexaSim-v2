const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const logger = require('../../includes/logger');

module.exports = {
    name: "qr-code",
    version: "1.0.0",
    author: "Hridoy",
    description: "Generate a gradient QR code from your text.",
    adminOnly: false,
    commandCategory: "Fun",
    guide: "Use {pn}qr-code your text here to generate a gradient QR code.",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event, args }) {
        const threadID = event.threadID;
        const messageID = event.messageID;

        let tempPath = null;

        try {
            const userText = args.join(" ").trim();
            if (!userText) {
                await api.sendMessage("❗ Please provide text to generate the QR code.\nExample: qr-code Hello World!", threadID, messageID);
                return;
            }

      
            const progressMsgID = await new Promise((resolve) => {
                api.sendMessage("⏳ Generating your QR code...", threadID, (err, info) => {
                    if (err) resolve(null);
                    else resolve(info.messageID);
                });
            });

        
            const apiUrl = `https://sus-apis.onrender.com/api/gradient-qr?text=${encodeURIComponent(userText)}`;
            const response = await axios.get(apiUrl, { responseType: "stream", timeout: 20000 });
            if (!response || !response.data || response.status !== 200) {
                throw new Error("Failed to generate QR code.");
            }

         
            const tempDir = path.join(__dirname, '..', '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const fileName = `qr_${crypto.randomBytes(8).toString('hex')}.png`;
            tempPath = path.join(tempDir, fileName);

            const writer = fs.createWriteStream(tempPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const imgMsg = {
                body: "🌈 Here is your gradient QR code!",
                attachment: fs.createReadStream(tempPath)
            };

            await new Promise((resolve, reject) => {
                api.sendMessage(imgMsg, threadID, async (err) => {
                    if (err) return reject(err);
                    api.setMessageReaction("🌈", messageID, () => {}, true);
                    if (progressMsgID) {
                        await api.unsendMessage(progressMsgID);
                    }
                    resolve();
                }, messageID);
            });

            logger.info(`[qr-code Command] Gradient QR code sent to ${event.senderID}`);

            if (tempPath && fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        } catch (err) {
            logger.error(`Error in qr-code command: ${err.message}`, { stack: err.stack });
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