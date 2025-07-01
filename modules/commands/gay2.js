const config = require('../../config/config.json');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const logger = require('../../includes/logger');

const FB_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
const LAUGH_EMOJIS = ["😂","🤣","😹","😆","😹","😆","😝","😄","😜","😹"];

module.exports = {
    name: "gay2",
    version: "1.0.0",
    author: "Hridoy",
    description: "Apply a pride overlay to a user's profile picture or an image and send a fun message.",
    adminOnly: false,
    commandCategory: "Fun",
    guide: "Use {pn}gay2 to apply a pride overlay to your profile picture.\n" +
           "Mention someone to use their profile picture, or reply to an image or message to use the sender's profile photo or the image.",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event, args }) {
        const threadID = event.threadID;
        const messageID = event.messageID;
        const senderID = event.senderID;

        let tempPath = null;
        let targetName = null;
        let foundUser = false;

        try {
          
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
                foundUser = true;
                imageUrl = getUserProfilePicUrl(event.messageReply.senderID);
        
                const userInfo = await new Promise((resolve, reject) => {
                    api.getUserInfo(event.messageReply.senderID, (err, info) => {
                        if (err) resolve({});
                        else resolve(info);
                    });
                });
                targetName = userInfo[event.messageReply.senderID]?.name || null;
            }


            if (!imageUrl && event.mentions && Object.keys(event.mentions).length > 0) {
                const mentionUID = Object.keys(event.mentions)[0];
                foundUser = true;
                imageUrl = getUserProfilePicUrl(mentionUID);
             
                const userInfo = await new Promise((resolve, reject) => {
                    api.getUserInfo(mentionUID, (err, info) => {
                        if (err) resolve({});
                        else resolve(info);
                    });
                });
                targetName = userInfo[mentionUID]?.name || null;
            }

            if (!imageUrl) {
                foundUser = true;
                imageUrl = getUserProfilePicUrl(senderID);
       
                const userInfo = await new Promise((resolve, reject) => {
                    api.getUserInfo(senderID, (err, info) => {
                        if (err) resolve({});
                        else resolve(info);
                    });
                });
                targetName = userInfo[senderID]?.name || null;
            }

            const apiUrl = `https://sus-apis.onrender.com/api/pride-overlay?image=${encodeURIComponent(imageUrl)}`;
            logger.info(`Calling pride-overlay API: ${apiUrl}`);

            const tempDir = path.join(__dirname, '..', '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const fileName = `gay2_${crypto.randomBytes(8).toString('hex')}.png`;
            tempPath = path.join(tempDir, fileName);

           
            const response = await axios.get(apiUrl, { responseType: 'stream', timeout: 20000 });
            if (!response || !response.data || response.status !== 200) {
                throw new Error("Failed to process the pride overlay image.");
            }
            const writer = fs.createWriteStream(tempPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

       
            const randomEmoji = LAUGH_EMOJIS[Math.floor(Math.random() * LAUGH_EMOJIS.length)];
            let msgBody;
            if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
               
                msgBody = `${config.bot.botName}: Look, I found a gay! ${randomEmoji}`;
            } else if (foundUser && targetName) {
                msgBody = `${config.bot.botName}: Look, I found a gay ${targetName}! ${randomEmoji}`;
            } else {
                msgBody = `${config.bot.botName}: Look, I found a gay! ${randomEmoji}`;
            }

            const imgMsg = {
                body: msgBody,
                attachment: fs.createReadStream(tempPath)
            };

            await new Promise((resolve, reject) => {
                api.sendMessage(imgMsg, threadID, async (err) => {
                    if (err) return reject(err);
                    api.setMessageReaction("🏳️‍🌈", messageID, () => {}, true);
                    if (progressMsgID) {
                        await api.unsendMessage(progressMsgID);
                    }
                    resolve();
                }, messageID);
            });

            logger.info(`[gay2 Command] Pride overlay image sent to ${senderID}`);

            if (tempPath && fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        } catch (err) {
            logger.error(`Error in gay2 command: ${err.message}`, { stack: err.stack });
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