const config = require('../../config/config.json');
const logger = require('../../includes/logger');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ====== CONFIG ZONE ======
const YTSEARCH_API_URL = 'https://nexalo-api.vercel.app/api/ytsearch';
const YTDL_PRIMARY_API = 'https://sus-apis-2.onrender.com/api/ytdlv3';
const YTDL_FALLBACK_API = 'https://nexalo-api.vercel.app/api/ytdl-v4';
// ==========================

module.exports = {
    name: "sing",
    version: "2.0.0",
    author: "Hridoy",
    description: "Search and download a song as an MP3 file by its name 🎵",
    adminOnly: false,
    commandCategory: "Music",
    guide: "Use {pn}sing <music name> to search and download a song as an MP3.\nExample: {pn}sing Blinding Lights",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event, args }) {
        const threadID = event.threadID;
        const messageID = event.messageID;
        const senderID = event.senderID;

        let filePath;
        let videoUrl;
        let progressMsgID = null;

        try {
            if (!event || !threadID || !messageID) {
                logger.error("Invalid event object in sing command", { event });
                return api.sendMessage(`${config.bot.botName}: ❌ Invalid event data.`, threadID);
            }

            const musicName = args.join(' ').trim();
            if (!musicName) {
                logger.warn("No music name provided");
                api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage(
                    `${config.bot.botName}: Please provide a music name. Example: {pn}sing Blinding Lights`,
                    threadID,
                    messageID
                );
            }

            logger.info(`Received command: .sing ${musicName} in thread ${threadID}`);

            const searchingBody = `${config.bot.botName}: 🔍 Searching...`;
            progressMsgID = await new Promise((resolve) => {
                api.sendMessage(searchingBody, threadID, (err, info) => {
                    if (err) resolve(null);
                    else resolve(info.messageID);
                });
            });

            const query = encodeURIComponent(musicName);
            const ytSearchUrl = `${YTSEARCH_API_URL}?query=${query}`;
            logger.info(`Sending YouTube search request: ${ytSearchUrl}`);

            const searchResponse = await axios.get(ytSearchUrl, { timeout: 10000 });

            if (!searchResponse.data || searchResponse.data.code !== 200 || !searchResponse.data.data || searchResponse.data.data.length === 0) {
                throw new Error("No music found for the given query");
            }

            if (progressMsgID) {
                await api.editMessage(`${config.bot.botName}: 📥 Downloading...`, progressMsgID, threadID);
            }

            const firstVideo = searchResponse.data.data[0];
            videoUrl = firstVideo.url;
            const title = firstVideo.title;
            const duration = firstVideo.duration;

            logger.info(`Selected YouTube video URL: ${videoUrl}`);

        
            let mp3DownloadUrl, usedApi, audioTitle;
            try {
                const primaryApiUrl = `${YTDL_PRIMARY_API}?url=${encodeURIComponent(videoUrl)}&format=mp3`;
                logger.info(`Trying primary MP3 API: ${primaryApiUrl}`);

                const primaryResponse = await axios.get(primaryApiUrl, { timeout: 15000 });

                if (primaryResponse.data && primaryResponse.data.success && primaryResponse.data.data && primaryResponse.data.data.downloadUrl) {
                    mp3DownloadUrl = primaryResponse.data.data.downloadUrl;
                    audioTitle = primaryResponse.data.data.title || title;
                    usedApi = 'primary';
                } else {
                    throw new Error("Primary API did not return a valid MP3 URL");
                }
            } catch (primaryErr) {
                logger.warn(`Primary API failed (${primaryErr.message}), falling back to local API`);
           
                const fallbackApiUrl = `${YTDL_FALLBACK_API}?url=${encodeURIComponent(videoUrl)}&format=mp3`;
                logger.info(`Trying fallback MP3 API: ${fallbackApiUrl}`);

                const fallbackResponse = await axios.get(fallbackApiUrl, { timeout: 15000 });

                if (fallbackResponse.data && fallbackResponse.data.success && fallbackResponse.data.downloadUrl) {
                    mp3DownloadUrl = fallbackResponse.data.downloadUrl;
                    audioTitle = fallbackResponse.data.title || title;
                    usedApi = 'fallback';
                } else {
                    throw new Error("Fallback API did not return a valid MP3 URL");
                }
            }

            logger.info(`Audio download URL: ${mp3DownloadUrl} (via ${usedApi} API)`);

            const tempDir = path.join(__dirname, '..', '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const fileName = `sing_${crypto.randomBytes(8).toString('hex')}.mp3`;
            filePath = path.join(tempDir, fileName);

   
            const mp3Response = await axios.get(mp3DownloadUrl, {
                responseType: 'stream',
                timeout: 20000
            });

            const contentType = mp3Response.headers['content-type'];
            if (!contentType || !contentType.startsWith('audio/')) {
                throw new Error("Downloaded content is not an audio file");
            }

            const writer = fs.createWriteStream(filePath);
            mp3Response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const stats = fs.statSync(filePath);
            if (stats.size === 0) throw new Error("Downloaded MP3 file is empty");

            if (progressMsgID) {
                await api.editMessage(`${config.bot.botName}: 📤 Sending...`, progressMsgID, threadID);
            }

            const userInfo = await new Promise((resolve, reject) => {
                api.getUserInfo([senderID], (err, info) => {
                    if (err) reject(err);
                    else resolve(info);
                });
            });
            const userName = userInfo[senderID]?.name || "Unknown User";

            const msg = {
                body: `${config.bot.botName}: 🎧 Here's the audio for "${audioTitle}" (${duration})!`,
                attachment: fs.createReadStream(filePath)
            };

            logger.info(`Sending audio file for: ${musicName}`);
            await new Promise((resolve, reject) => {
                api.sendMessage(msg, threadID, async (err) => {
                    if (err) return reject(err);
                    api.setMessageReaction("🎵", messageID, () => {}, true);
             
                    if (progressMsgID) {
                        await api.unsendMessage(progressMsgID);
                    }
                    resolve();
                }, messageID);
            });
            logger.info("Audio file sent successfully");

            fs.unlinkSync(filePath);
            logger.info(`[Sing Command] Downloaded "${audioTitle}" (${duration}) for ${userName}`);
        } catch (err) {
            logger.error(`Error in sing command: ${err.message}`, { stack: err.stack });

            api.setMessageReaction("❌", messageID, () => {}, true);

 
            if (progressMsgID) {
                await api.editMessage(
                    `${config.bot.botName}: ⚠️ Error: ${err.message}\nYou can listen to the song here: ${videoUrl || 'Not available'}`,
                    progressMsgID,
                    threadID
                );
            } else {
                await api.sendMessage(
                    `${config.bot.botName}: ⚠️ Error: ${err.message}\nYou can listen to the song here: ${videoUrl || 'Not available'}`,
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
