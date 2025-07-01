const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    name: "bonk",
    version: "2.0.0",
    author: "hridoy09bg",
    description: "Bonk someone or something with a hammer using their avatar or a replied image.",
    commandCategory: "fun",
    guide: "Use {pn}bonk [@tag or reply an image or message]",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event }) {
        let imageUrl;
        const cachePath = path.join(__dirname, "cache");
        await fs.ensureDir(cachePath);
        const fileName = `bonk_${event.messageID}_${Date.now()}.gif`;
        const filePath = path.join(cachePath, fileName);

   
        if (event.type === "message_reply" && event.messageReply) {
  
            const reply = event.messageReply;
            if (reply.attachments && reply.attachments[0] && reply.attachments[0].type === "photo") {
                imageUrl = reply.attachments[0].url;
            } else if (reply.senderID) {
             
                imageUrl = `https://graph.facebook.com/${reply.senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            }
        }

        else if (event.mentions && Object.keys(event.mentions).length > 0) {
            const id = Object.keys(event.mentions)[0];
            imageUrl = `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        }

        else {
            imageUrl = `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        }

 
        const apiUrl = `https://sus-apis.onrender.com/api/bonk-hammer?image=${encodeURIComponent(imageUrl)}`;

        await api.sendMessage("Bonking... 🔨 - it will take some time...", event.threadID, event.messageID);

        try {
            const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
            await fs.writeFile(filePath, response.data);

            await api.sendMessage({
                body: "BONK! 🔨",
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlink(filePath), event.messageID);
        } catch (err) {
            await api.sendMessage("Failed to bonk! Try again later.", event.threadID, event.messageID);
        }
    }
};