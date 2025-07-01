const config = require('../../config/config.json');
const logger = require('../../includes/logger');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ====== CONFIG ZONE ======
const YTDL_PRIMARY_API = 'https://sus-apis.onrender.com/api/ytdlv3';
const YTDL_FALLBACK_API = 'http://localhost:4000/api/ytdl-v4';
// ==========================

module.exports = {
    name: "ytdl",
    version: "120.0",
    author: "Hridoy",
    description: "Download a YouTube video and send it to the user 📹",
    adminOnly: false,
    commandCategory: "Media",
    guide: "Use {pn}ytdl <video_url> to download a YouTube video.\n" +
           "Example: {pn}ytdl https://www.youtube.com/watch?v=aUut5qQECc4",
    cooldowns: 10,
    usePrefix: true,

    async execute({ api, event, args }) {
        const threadID = event.threadID;
        const messageID = event.messageID;
        const senderID = event.senderID;

        let filePath;
        let progressMsgID = null;

        try {
            if (!event || !threadID || !messageID) {
                logger.error("Invalid event object in ytdl command", { event });
                return api.sendMessage(`${config.bot.botName}: ❌ Invalid event data.`, threadID);
            }

            if (!args[0]) {
                logger.warn("No video URL provided in ytdl command");
                api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage(
                    `${config.bot.botName}: ❌ Please provide a YouTube video URL. Example: {pn}ytdl <video_url>`,
                    threadID,
                    messageID
                );
            }

            const videoUrl = args[0].trim();
            if (!videoUrl.startsWith('https://') || (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be'))) {
                logger.warn(`Invalid YouTube video URL provided: ${videoUrl}`);
                api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage(
                    `${config.bot.botName}: ❌ Please provide a valid YouTube video URL.`,
                    threadID,
                    messageID
                );
            }

            logger.info(`Downloading YouTube video for URL: ${videoUrl} in thread ${threadID}`);

            progressMsgID = await new Promise((resolve) => {
                api.sendMessage(`${config.bot.botName}: 🔍 Searching...`, threadID, (err, info) => {
                    if (err) resolve(null);
                    else resolve(info.messageID);
                });
            });

            let videoDownloadUrl, usedApi, videoTitle;
            try {
                const apiUrl = `${YTDL_PRIMARY_API}?url=${encodeURIComponent(videoUrl)}&format=mp4`;
                logger.info(`Trying primary MP4 API: ${apiUrl}`);
                const primaryResponse = await axios.get(apiUrl, { timeout: 20000 });

                if (primaryResponse.data && primaryResponse.data.success && primaryResponse.data.data && primaryResponse.data.data.downloadUrl) {
                    videoDownloadUrl = primaryResponse.data.data.downloadUrl;
                    videoTitle = primaryResponse.data.data.title || "YouTube Video";
                    usedApi = 'primary';
                } else {
                    throw new Error("Primary API did not return a valid MP4 URL");
                }
            } catch (primaryErr) {
                logger.warn(`Primary API failed (${primaryErr.message}), falling back to local API`);
             
                const fallbackApiUrl = `${YTDL_FALLBACK_API}?url=${encodeURIComponent(videoUrl)}&format=mp4`;
                logger.info(`Trying fallback MP4 API: ${fallbackApiUrl}`);

                const fallbackResponse = await axios.get(fallbackApiUrl, { timeout: 20000 });

                if (fallbackResponse.data && fallbackResponse.data.success && fallbackResponse.data.downloadUrl) {
                    videoDownloadUrl = fallbackResponse.data.downloadUrl;
                    videoTitle = fallbackResponse.data.title || "YouTube Video";
                    usedApi = 'fallback';
                } else {
                    throw new Error("Fallback API did not return a valid MP4 URL");
                }
            }

            logger.info(`Video download URL: ${videoDownloadUrl} (via ${usedApi} API)`);

            if (progressMsgID) {
                await api.editMessage(`${config.bot.botName}: 📥 Downloading...`, progressMsgID, threadID);
            }

            const tempDir = path.join(__dirname, '..', '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const fileName = `ytdl_${crypto.randomBytes(8).toString('hex')}.mp4`;
            filePath = path.join(tempDir, fileName);

            const videoResponse = await axios.get(videoDownloadUrl, {
                responseType: 'stream',
                timeout: 60000
            });

            const contentType = videoResponse.headers['content-type'];
            if (!contentType || (!contentType.startsWith('video/') && contentType !== 'application/octet-stream')) {
                throw new Error(`API response has unexpected Content-Type: ${contentType}`);
            }

            const writer = fs.createWriteStream(filePath);
            videoResponse.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const stats = fs.statSync(filePath);
            if (stats.size === 0) throw new Error("Downloaded video file is empty");

            if (progressMsgID) {
                await api.editMessage(`${config.bot.botName}: 📤 Sending...`, progressMsgID, threadID);
            }

            const senderInfo = await new Promise((resolve, reject) => {
                api.getUserInfo([senderID], (err, info) => {
                    if (err) reject(err);
                    else resolve(info);
                });
            });
            const senderName = senderInfo[senderID]?.name || "Unknown User";

            const msg = {
                body: `${config.bot.botName}: 📹 ${videoTitle}`,
                attachment: fs.createReadStream(filePath)
            };

            logger.info(`Sending video "${videoTitle}" to ${senderName} in thread ${threadID}`);
            await new Promise((resolve, reject) => {
                api.sendMessage(msg, threadID, async (err) => {
                    if (err) return reject(err);
                    api.setMessageReaction("📹", messageID, () => {}, true);

                    if (progressMsgID) {
                        await api.unsendMessage(progressMsgID);
                    }
                    resolve();
                }, messageID);
            });
            logger.info("Video sent successfully");

            fs.unlinkSync(filePath);
            logger.info(`[YTDL Command] Sent video "${videoTitle}" to ${senderName}`);
        } catch (err) {
            logger.error(`Error in ytdl command: ${err.message}`, { stack: err.stack });

            api.setMessageReaction("❌", messageID, () => {}, true);

            if (progressMsgID) {
                await api.editMessage(
                    `${config.bot.botName}: ⚠️ Error: ${err.message}`,
                    progressMsgID,
                    threadID
                );
            } else {
                await api.sendMessage(
                    `${config.bot.botName}: ⚠️ Error: ${err.message}`,
                    threadID,
                    messageID
                );
            }

            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }
};