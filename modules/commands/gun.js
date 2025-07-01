
const config = require('../../config/config.json');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const logger = require('../../includes/logger');

const FB_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

module.exports = {
    name: "gun",
    version: "1.0.0",
    author: "Hridoy",
    description: "Add a gun meme effect to a user's image or text.",
    adminOnly: false,
    commandCategory: "Fun",
    guide: "Reply to any image or text or mention someone or use the command alone to make a gun meme. Optionally provide text after the command.",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event, args }) {
        const threadID = event.threadID;
        const messageID = event.messageID;
        const senderID = event.senderID;

        let tempPath = null;


        function getUserProfilePicUrl(uid) {
            return `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=${FB_TOKEN}`;
        }

        try {
   
            let userText = args.join(" ").trim();


            if (!userText && event.type === "message_reply" && event.messageReply && event.messageReply.body) {
                userText = event.messageReply.body;
            }

            if (!userText) {
                userText = "Bang!";
            }

            const progressMsgID = await new Promise((resolve) => {
                api.sendMessage(`${config.bot.botName}: 🔫 Generating gun meme...`, threadID, (err, info) => {
                    if (err) resolve(null);
                    else resolve(info.messageID);
                });
            });

  
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

            const apiUrl = `https://sus-apis.onrender.com/api/gun-meme?image=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(userText)}`;
            logger.info(`Calling gun-meme API: ${apiUrl}`);

        
            const tempDir = path.join(__dirname, '..', '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const fileName = `gun_${crypto.randomBytes(8).toString('hex')}.png`;
            tempPath = path.join(tempDir, fileName);

    
            const response = await axios.get(apiUrl, { responseType: 'stream', timeout: 20000 });
            if (!response || !response.data || response.status !== 200) {
                throw new Error("Failed to generate gun meme image.");
            }
            const writer = fs.createWriteStream(tempPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const imgMsg = {
                body: `${config.bot.botName}: 🔫 Gun meme generated!`,
                attachment: fs.createReadStream(tempPath)
            };

            await new Promise((resolve, reject) => {
                api.sendMessage(imgMsg, threadID, async (err) => {
                    if (err) return reject(err);
                    api.setMessageReaction("🔫", messageID, () => {}, true);
                    if (progressMsgID) {
                        await api.unsendMessage(progressMsgID);
                    }
                    resolve();
                }, messageID);
            });

            logger.info(`[gun Command] Gun meme sent to ${senderID}`);

            if (tempPath && fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        } catch (err) {
            logger.error(`Error in gun command: ${err.message}`, { stack: err.stack });
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