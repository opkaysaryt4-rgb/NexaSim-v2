const config = require('../../config/config.json');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const logger = require('../../includes/logger');

const FB_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

module.exports = {
    name: "reven",
    version: "1.0.0",
    author: "Hridoy",
    description: "Raven presenting your message with an image.",
    adminOnly: false,
    commandCategory: "Fun",
    guide: "Use {pn}reven [message] - reply to an image, mention a user, or let it use your profile pic.",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event, args }) {
        const threadID = event.threadID;
        const messageID = event.messageID;
        const senderID = event.senderID;

        let tempPath = null;

        try {
            const userMsg = args.join(" ").trim();
            if (!userMsg) {
                await api.sendMessage("❗ Please provide a message for Raven to present.\nExample: reven Hello World!", threadID, messageID);
                return;
            }

            const progressMsgID = await new Promise((resolve) => {
                api.sendMessage(`${config.bot.botName}: 🖼️ Processing...`, threadID, (err, info) => {
                    if (err) resolve(null);
                    else resolve(info.messageID);
                });
            });

            function getUserProfilePicUrl(uid) {
                return `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=${FB_TOKEN}`;
            }

            let imageUrl = null;

      
            if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
                const imgAttachment = event.messageReply.attachments.find(att => att.type === "photo" && att.url);
                if (imgAttachment) {
                    imageUrl = imgAttachment.url;
                }
            }


            if (!imageUrl && event.messageReply && event.messageReply.senderID) {
                imageUrl = getUserProfilePicUrl(event.messageReply.senderID);
            }

      
            if (!imageUrl && event.mentions && Object.keys(event.mentions).length > 0) {
                const mentionUID = Object.keys(event.mentions)[0];
                imageUrl = getUserProfilePicUrl(mentionUID);
            }

            if (!imageUrl) {
                imageUrl = getUserProfilePicUrl(senderID);
            }

    
            const apiUrl = `https://sus-apis.onrender.com/api/raven-presenting?image=${encodeURIComponent(imageUrl)}&message=${encodeURIComponent(userMsg)}`;
            logger.info(`Calling raven-presenting API: ${apiUrl}`);

            const tempDir = path.join(__dirname, '..', '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const fileName = `reven_${crypto.randomBytes(8).toString('hex')}.png`;
            tempPath = path.join(tempDir, fileName);

            const response = await axios.get(apiUrl, { responseType: 'stream', timeout: 20000 });
            if (!response || !response.data || response.status !== 200) {
                throw new Error("Failed to process the Raven presenting image.");
            }
            const writer = fs.createWriteStream(tempPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const imgMsg = {
                body: `${config.bot.botName}: 🦉 Here is your Raven presenting image!`,
                attachment: fs.createReadStream(tempPath)
            };

            await new Promise((resolve, reject) => {
                api.sendMessage(imgMsg, threadID, async (err) => {
                    if (err) return reject(err);
                    api.setMessageReaction("🦉", messageID, () => {}, true);
                    if (progressMsgID) {
                        await api.unsendMessage(progressMsgID);
                    }
                    resolve();
                }, messageID);
            });

            logger.info(`[reven Command] Raven presenting image sent to ${senderID}`);

            if (tempPath && fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        } catch (err) {
            logger.error(`Error in reven command: ${err.message}`, { stack: err.stack });
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