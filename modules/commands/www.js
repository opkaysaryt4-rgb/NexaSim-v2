const config = require('../../config/config.json');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const logger = require('../../includes/logger');

const FB_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

module.exports = {
    name: "www",
    version: "1.0.0",
    author: "Hridoy",
    description: "Who would win? Generates a versus image using the avatars of two mentioned users.",
    adminOnly: false,
    commandCategory: "Fun",
    guide: "Use {pn}www @someone or {pn}www @someone1 @someone2 to generate a 'Who Would Win' image.",
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
       
            const mentionUIDs = event.mentions ? Object.keys(event.mentions) : [];
            if (mentionUIDs.length === 0) {
                await api.sendMessage(
                    "❗ Please mention at least one person to compare.\nExample: www @someone or www @someone1 @someone2",
                    threadID,
                    messageID
                );
                return;
            }

            const progressMsgID = await new Promise((resolve) => {
                api.sendMessage(`${config.bot.botName}: 🖼️ Generating 'Who Would Win' image...`, threadID, (err, info) => {
                    if (err) resolve(null);
                    else resolve(info.messageID);
                });
            });

          
            let image1, image2;
            if (mentionUIDs.length === 1) {
                image1 = getUserProfilePicUrl(mentionUIDs[0]);
                image2 = getUserProfilePicUrl(senderID);
            } else {
                image1 = getUserProfilePicUrl(mentionUIDs[0]);
                image2 = getUserProfilePicUrl(mentionUIDs[1]);
            }

   
            const apiUrl = `https://sus-apis.onrender.com/api/who-would-win?image1=${encodeURIComponent(image1)}&image2=${encodeURIComponent(image2)}`;
            logger.info(`Calling who-would-win API: ${apiUrl}`);

            const tempDir = path.join(__dirname, '..', '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const fileName = `www_${crypto.randomBytes(8).toString('hex')}.png`;
            tempPath = path.join(tempDir, fileName);

    
            const response = await axios.get(apiUrl, { responseType: 'stream', timeout: 20000 });
            if (!response || !response.data || response.status !== 200) {
                throw new Error("Failed to generate 'Who Would Win' image.");
            }
            const writer = fs.createWriteStream(tempPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

        
            const imgMsg = {
                body: `${config.bot.botName}: 🤼 Here is your 'Who Would Win?' image!`,
                attachment: fs.createReadStream(tempPath)
            };

            await new Promise((resolve, reject) => {
                api.sendMessage(imgMsg, threadID, async (err) => {
                    if (err) return reject(err);
                    api.setMessageReaction("🤼", messageID, () => {}, true);
                    if (progressMsgID) {
                        await api.unsendMessage(progressMsgID);
                    }
                    resolve();
                }, messageID);
            });

            logger.info(`[www Command] Who Would Win image sent to ${senderID}`);

            if (tempPath && fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        } catch (err) {
            logger.error(`Error in www command: ${err.message}`, { stack: err.stack });
            api.setMessageReaction("❌", messageID, () => {}, true);
            await api.sendMessage(
                `${config.bot.botName}: ⚠️ Error: ${err.message}`,
                threadID,
                messageID
            );
            if (tempPath && fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        }
    }
};