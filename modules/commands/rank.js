const config = require('../../config/config.json');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { connect } = require('../../includes/database');
const logger = require('../../includes/logger');

module.exports = {
    name: "rank",
    version: "2.0.0",
    author: "Hridoy",
    description: "Shows the rank card of the command user or a mentioned user.",
    adminOnly: false,
    commandCategory: "utility",
    guide: "Use {pn}rank to show your rank, or {pn}rank @user to show their rank.",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event, args }) {
        if (!event || !event.threadID || !event.messageID) {
            logger.error("Invalid event object in rank command");
            return api.sendMessage(`${config.bot.botName}: ❌ Invalid event data.`, event.threadID);
        }

        const db = await connect();
        const usersCollection = db.collection('users');

        let targetUid;
        let targetName = "User";

        if (args.length > 0 && event.mentions && Object.keys(event.mentions).length > 0) {
            targetUid = Object.keys(event.mentions)[0];
            targetName = event.mentions[targetUid].replace(/@/g, '');
        } else {
            targetUid = event.senderID;
            const userInfo = await new Promise((resolve) => {
                api.getUserInfo(targetUid, (err, info) => resolve(err ? {} : info));
            });
            targetName = userInfo[targetUid]?.name || "User";
        }

        const user = await usersCollection.findOne({ userId: targetUid });
        if (!user) {
            return api.sendMessage(`${config.bot.botName}: ⚠️ User not found in database.`, event.threadID);
        }

        const profilePicUrl = `https://graph.facebook.com/${targetUid}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
        const level = user.rank || 1;
        const xp = user.xp || 0;
        const rank = user.rank_position || 1; 
        const nextLevelXp = (level * 100) + 1000; 

        const rankApiUrl = `https://sus-apis.onrender.com/api/rank-card?avatar=${encodeURIComponent(profilePicUrl)}&username=${encodeURIComponent(targetName)}&level=${level}&currentXP=${xp}&requiredXP=${nextLevelXp}&rank=${rank}`;

        try {
    
            const response = await axios.get(rankApiUrl, { responseType: 'stream' });

            const tempDir = path.join(__dirname, '../../temp');
            await fs.ensureDir(tempDir);
            const tempFilePath = path.join(tempDir, `rank_${targetUid}_${Date.now()}.png`);
            const writer = fs.createWriteStream(tempFilePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            await new Promise((resolve, reject) => {
                api.sendMessage(
                    {
                        body: `${config.bot.botName}: Rank card for ${targetName}`,
                        attachment: fs.createReadStream(tempFilePath)
                    },
                    event.threadID,
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });

            await fs.unlink(tempFilePath);
            logger.info(`Sent rank card for user ${targetUid} and deleted temp file`);
        } catch (error) {
            logger.error(`Error in rank command for user ${targetUid}: ${error.message}`);
            api.sendMessage(`${config.bot.botName}: ❌ Failed to generate or send rank card.`, event.threadID);
        }
    }
};